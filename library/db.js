let DbClass = function () {
    this.Helpers = new HelpersClass()
    this.Helpers.initializeUser()
    this.serverIP = ''
    this.user = ''
    this.port = ''
    this.database = ''
    this.products = []
    this.divisions = []
    this.vessels = []
    this.colors = []
    this.individualServiceTypes = []
    this.consolidationServiceTypes = []
    this.pieCreated = false
    this.mysqlConn = null
    this.getServerDataFromRegistry()
}

/**************** GENERALS ***********************/

DbClass.prototype.getServerDataFromRegistry = function () {
    let self = this

    let fs = require('fs')
    var dbFile = fs.readFileSync('C:\\ForwardTool\\dbdata.agcfg', 'utf8')

    var dbFileData = dbFile.split(';')
    self.database = dbFileData[0]
    self.port = dbFileData[1]
    self.serverIP = dbFileData[2]
    self.user = dbFileData[3]
    self.dbpass = dbFileData[4]
    self.connectToDatabase()
}

DbClass.prototype.connectToDatabase = function () {
    let self = this
    const mysql = require('mysql')

    self.mysqlConn = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        multipleStatements: true,
        dateStrings: true,
    })
    self.mysqlConn.connect()
}

DbClass.prototype.verifyLogin = function (username, password) {
    let self = this
    var md5 = require('md5')

    password = md5(password)
    self.mysqlConn.query(
        'SELECT * FROM users WHERE user_username = "' + username + '" AND user_password = "' + password + '" LIMIT 1',
        function (error, user) {
            if (error) throw error

            if (user.length === 0) {
                $('#user_username').val('').blur()
                $('#user_password').val('').blur()

                self.Helpers.toastr('error', 'Wrong username or password. Please try again.')
            } else {
                self.Helpers.saveUserData(user[0])
                $('#sign-in-btn').prop('disabled', 'disabled')
                $('#sign-in-btn').html('attempting connection...')

                ipcRenderer.send('loadTransfers', user[0])
            }
        }
    )
}

DbClass.prototype.getAllDivisions = function () {
    let self = this
    const sql = 'SELECT * FROM divisions'
    self.mysqlConn.query(sql, function (error, divisions) {
        if (error) throw error
        self.divisions = divisions
    })
}

DbClass.prototype.getAllProducts = function () {
    let self = this
    const sql = 'SELECT * FROM products'
    self.mysqlConn.query(sql, function (error, products) {
        if (error) throw error
        self.products = products
    })
}

DbClass.prototype.getAllVessels = function () {
    let self = this
    const sql = 'SELECT * FROM vessels WHERE vessel_deleted = 0 ORDER BY vessel_description'
    self.mysqlConn.query(sql, function (error, vessels) {
        if (error) throw error
        self.vessels = vessels
    })
}

DbClass.prototype.getAllColors = function () {
    let self = this
    const sql =
        'Select * FROM colors WHERE color_code NOT IN (Select ind_group_color FROM individual_groups WHERE ind_group_confirmation_date is null);'

    self.mysqlConn.query(sql, function (error, colors) {
        if (error) throw error
        self.colors = colors
    })
}

DbClass.prototype.getAllServiceTypes = function () {
    let self = this

    const sql = 'SELECT * FROM service_types WHERE service_type_deleted = 0 order by service_type_description ASC;'
    self.mysqlConn.query(sql, function (error, serviceTypes) {
        if (error) throw error
        for (let serviceType of serviceTypes) {
            if (serviceType.service_type_group == 'Individuals') {
                self.individualServiceTypes.push(serviceType)
            }
            if (serviceType.service_type_group == 'Consolidations') {
                self.consolidationServiceTypes.push(serviceType)
            }
        }
        self.serviceTypes = self.individualServiceTypes.concat(self.consolidationServiceTypes)
    })
}

DbClass.prototype.getAllCities = function () {
    let self = this

    const sql = 'SELECT * FROM cities WHERE city_deleted = 0 order by city_name'
    self.mysqlConn.query(sql, function (error, cities) {
        if (error) throw error
        self.cities = cities
    })
}

DbClass.prototype.initializeGroupCitySelect = function (exCityName, toCityName) {
    let self = this

    let exSelectedId = 0
    let toSelectedId = 0
    $('#group-to-select').empty()
    $('#group-ex-select').empty()
    $('#group-to-select').append('<option></option>')
    $('#group-ex-select').append('<option></option>')
    for (i = 0; i < self.cities.length; i++) {
        if (self.cities[i].city_name == exCityName) {
            exSelectedId = self.cities[i].city_id
        }
        if (self.cities[i].city_name == toCityName) {
            toSelectedId = self.cities[i].city_id
        }
        $('#group-ex-select').append(new Option(self.cities[i].city_name, self.cities[i].city_id))
        $('#group-to-select').append(new Option(self.cities[i].city_name, self.cities[i].city_id))
    }
    $('#group-ex-select').val(exSelectedId)
    $('#group-to-select').val(toSelectedId)
    $('#group-ex-select').trigger('chosen:updated')
    $('#group-to-select').trigger('chosen:updated')
}

/**************** END OF GENERALS ***********************/

/**************** INDIVIDUALS ***********************/

DbClass.prototype.getAllIndividuals = function () {
    let self = this

    var sql =
        'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' ind_jobs.ind_products,' +
        ' ind_jobs.ind_mode,' +
        ' ind_jobs.ind_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' CASE' +
        ' WHEN ind_jobs.ind_deadline = "TBA" THEN "TBA"' +
        ' ELSE DATE_FORMAT(ind_jobs.ind_deadline, "%d/%m/%Y")' +
        ' END AS ind_deadline, ' +
        ' ind_jobs.ind_forwarder,' +
        ' ind_jobs.ind_reference,' +
        ' ind_jobs.ind_kg,' +
        ' Round(ind_jobs.ind_estimate_cost,2) as ind_estimate_cost,' +
        ' ind_jobs.ind_notes,' +
        ' ind_jobs.ind_group_id,' +
        ' ind_jobs.ind_is_grouped,' +
        ' individual_groups.ind_group_color,' +
        ' individual_groups.ind_group_cost,' +
        ' DATE_FORMAT(individual_groups.ind_group_deadline, "%d/%m/%Y") as ind_group_deadline,' +
        ' individual_groups.ind_group_forwarder, ' +
        ' (SELECT Round(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id AND ind_deleted = 0)  as sum_estimated_cost,' +
        ' individual_groups.ind_group_active,' +
        ' ind_jobs.ind_actual_cost,' +
        ' service_types.service_type_description,' +
        ' UNIX_TIMESTAMP(ind_jobs.ind_request_date) as ind_timestamp,' +
        ' ind_jobs.ind_pieces,' +
        ' ind_jobs.ind_currency,' +
        ' ind_jobs.ind_rate,' +
        ' individual_groups.ind_group_rate,' +
        ' individual_groups.ind_group_currency' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = ind_jobs.ind_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = ind_jobs.ind_to' +
        ' LEFT JOIN service_types as service_types on service_types.service_type_id = ind_jobs.ind_service_type' +
        ' WHERE ind_jobs.ind_status = "Pending" AND ind_deleted = 0' +
        ' ;'

    self.mysqlConn.query(sql, function (error, data) {
        if (error) throw error
        var jobs_table = $('#jobs_table').DataTable({
            data: data,
            processing: true,
            fixedHeader: {
                headerOffset: 100,
                header: true,
                footer: false,
            },
            bLengthChange: false,
            columns: [
                { title: 'JOB ID', orderable: false, data: 'ind_id' },
                { title: 'REQ. DATE', orderable: false, data: 'ind_request_date' },
                { title: 'USER', orderable: false, data: 'user_username' },
                { title: 'DEPARTMENT', orderable: false, data: 'division_description' },
                { title: 'PRODUCTS', orderable: false, data: 'ind_products' },
                {
                    title: 'MODE',
                    orderable: false,
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.ind_mode == 'Personnel') {
                            $(td).css('color', 'blue').css('font-weight', 'bold')
                        }
                    },
                    data: 'ind_mode',
                },
                {
                    title: 'SERVICE',
                    orderable: false,
                    data: 'service_type_description',
                },
                { title: 'VESSELS', orderable: false, data: 'ind_vessels' },
                {
                    title: 'EX',
                    orderable: false,
                    className: 'danger-header',
                    data: 'ex_city',
                },
                {
                    title: 'TO',
                    orderable: false,
                    className: 'danger-header',
                    data: 'to_city',
                },
                {
                    title: 'DEADLINE',
                    orderable: false,
                    className: 'danger-header',
                    data: 'ind_deadline',
                },
                { title: 'FORWARDER', orderable: false, data: 'ind_forwarder' },
                { title: 'REFERENCE', orderable: false, data: 'ind_reference' },
                { title: 'PIECES', orderable: false, data: 'ind_pieces' },
                { title: 'WEIGHT (KG)', orderable: false, data: 'ind_kg' },
                {
                    title: 'ESTIMATE COST (€)',
                    orderable: false,
                    data: 'ind_estimate_cost',
                },
                { title: 'NOTES', visible: false, data: 'ind_notes' },
                { title: 'Group', visible: false, data: 'ind_group_id' },
                { title: 'Is grouped', visible: false, data: 'ind_is_grouped' },
                { title: 'Group Color', visible: false, data: 'ind_group_color' },
                { title: 'Group Cost', visible: false, data: 'ind_group_cost' },
                {
                    title: 'GROUP DEADLINE',
                    orderable: false,
                    visible: false,
                    data: 'ind_group_deadline',
                },
                {
                    title: 'GROUP FORWARDER',
                    orderable: false,
                    data: 'ind_group_forwarder',
                },
                {
                    title: 'Sum estimate cost',
                    visible: false,
                    data: 'sum_estimated_cost',
                },
                {
                    title: 'Group Active',
                    visible: false,
                    data: 'ind_group_active',
                },
                {
                    title: 'Actual Cost',
                    visible: false,
                    data: 'ind_actual_cost',
                },
                {
                    title: 'Timestamp',
                    visible: false,
                    data: 'ind_timestamp',
                },
                {
                    title: 'ACTIONS',
                    orderable: false,
                    createdCell: function (td, cellData, rowData, row, col) {
                        if (rowData.ind_is_grouped == 1) {
                            if (rowData.ind_group_active == 0) {
                                $(td).children('.job-edit').hide()
                                $(td).children('.delete-job').hide()
                            } else {
                                if (self.Helpers.groupDataAreEmpty(rowData)) $(td).children('.confirm-job').hide()
                            }
                        } else {
                            if (self.Helpers.individualDataAreEmpty(rowData, false)) $(td).children('.confirm-job').hide()
                        }
                    },
                    defaultContent:
                        "<i class='fa fa-search job-edit action-btn' title='modify' id='delete-me' style='cursor: pointer'></i><i class='fa fa-check confirm-job action-btn' title='confirm' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' title='costs' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' title='delete' style='cursor: pointer' ></i>",
                },
            ],
            rowCallback: function (row, data, index, cells) {
                // Here I am changing background Color
                if (data.ind_group_color != 'empty') {
                    $('td', row).css('background-color', data.ind_group_color)
                }
            },
            order: [
                [18, 'desc'],
                [17, 'desc'],
                [0, 'desc'],
            ],
            pageLength: 25,
        })

        $('#jobs_table').on('click', 'i.job-edit', function () {
            var data = jobs_table.row($(this).closest('tr')).data()
            if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
                Swal.fire({
                    title: 'Unable to edit this job.',
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: 'error',
                    showCancelButton: true,
                    showConfirmButton: false,
                })
                return
            }

            self.Helpers.initliazeModalToEditJob(self.divisions, self.products, self.vessels, self.cities, self.individualServiceTypes, data)

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            $('#save-job-btn').unbind('click')
            $('#save-job-btn').on('click', function () {
                $(this).attr('disabled', 'disabled')
                var modeSelectValue = $('#mode-select').val()
                var divisionSelectValue = $('#division-select').val()
                var productSelectValue = $('#product-select').val()
                var vesselSelectValue = $('#vessel-select').val()
                var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
                var forwarder = $('#forwarder').val()
                var ind_ex = $('#ex-input').val()
                var ind_to = $('#to-input').val()
                let currency = $('#currency').val()
                let rate = 1 / currency
                let currencyText = $('#currency option:selected').text()
                var reference = $('#reference').val()
                var kg = self.Helpers.formatFloatValue($('#kg').val())
                var deadline = $('#deadline_date').val()
                let serviceType = $('#service-type-select').val()
                let pieces = self.Helpers.formatFloatValue($('#pieces').val())

                if ((deadline != '') & (modeSelectValue != '') && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '') {
                    $(this).attr('disabled', 'disabled')

                    //change productIds to product Names
                    var productsNames = []
                    for (i = 0; i < self.products.length; i++) {
                        if (productSelectValue.indexOf(self.products[i].product_id.toString()) !== -1) {
                            //this means i found the product
                            productsNames.push(self.products[i].product_description)
                        }
                    }

                    var vesselsNames = []
                    for (i = 0; i < self.vessels.length; i++) {
                        if (vesselSelectValue.indexOf(self.vessels[i].vessel_id.toString()) !== -1) {
                            //this means i found the vessel
                            vesselsNames.push(self.vessels[i].vessel_description)
                        }
                    }

                    if (ind_ex != '' && ind_to != '') {
                        var jobObject = {
                            ind_id: data.ind_id,
                            ind_user_id: self.Helpers.user_id,
                            ind_division_id: divisionSelectValue,
                            ind_products: productsNames.join(';'),
                            ind_mode: modeSelectValue,
                            ind_vessels: vesselsNames.join(';'),
                            ind_ex: ind_ex,
                            ind_to: ind_to,
                            ind_deadline: self.Helpers.changeDateToMysql(deadline),
                            ind_forwarder: forwarder,
                            ind_notes: $('#notes').val(),
                            ind_estimate_cost: self.Helpers.applyRate(estimatecostSelectValue, 1 / currency),
                            ind_reference: reference,
                            ind_kg: kg,
                            ind_group_id: 0,
                            ind_pieces: pieces,
                            ind_service_type: serviceType == '' ? 0 : serviceType,
                            ind_rate: rate,
                            ind_currency: currencyText,
                            old_group_id: data.ind_group_id,
                        }

                        self.updateJob(jobObject)
                    } else {
                        $(this).attr('disabled', null)
                        self.Helpers.toastr('error', 'Some required fields are empty.')
                    }
                } else {
                    $(this).attr('disabled', null)
                    self.Helpers.toastr('error', 'Some required fields are empty.')
                }
            })
        })

        $('#jobs_table').on('click', 'i.confirm-job', function () {
            var data = jobs_table.row($(this).closest('tr')).data()
            if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
                Swal.fire({
                    title: 'Unable to confirm this job.',
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: 'error',
                    showCancelButton: true,
                    showConfirmButton: false,
                })
                return
            }

            if (data.ind_mode == 'Personnel') {
                if (self.Helpers.individualDataAreEmpty(data, false)) {
                    Swal.fire({
                        title: 'Unable to confirm this job.',
                        text: 'Some data are empty. You cannot confirm this job.',
                        icon: 'error',
                        showCancelButton: true,
                        showConfirmButton: false,
                    })
                    return
                }
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'If you confirm the job you will be unable to edit it!',
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#dc3545',
                    confirmButtonText: 'Confirm',
                }).then(result => {
                    if (result.isConfirmed) {
                        self.confirmPersonnel(data.ind_id)
                    }
                })
            } else {
                // checking if the individual is grouped...

                if (data.ind_is_grouped == 0) {
                    if (self.Helpers.individualDataAreEmpty(data, false)) {
                        Swal.fire({
                            title: 'Unable to confirm this job.',
                            text: 'Some data are empty. You cannot confirm this job.',
                            icon: 'error',
                            showCancelButton: true,
                            showConfirmButton: false,
                        })
                        return
                    }
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'If you confirm the job you will be unable to edit it!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Confirm',
                    }).then(result => {
                        if (result.isConfirmed) {
                            self.confirmIndividualGroup(data.ind_group_id)
                        }
                    })
                } else {
                    if (data.ind_group_active == 1) {
                        Swal.fire({
                            title: 'Unable to confirm this job.',
                            text: `Some data are empty. You cannot confirm this group.`,
                            icon: 'error',
                            showCancelButton: true,
                            showConfirmButton: false,
                        })
                        return
                    }
                    let allData = jobs_table.rows().data()
                    for (let i = 0; i < allData.length; i++) {
                        if (allData[i].ind_group_id == data.ind_group_id) {
                            if (self.Helpers.individualDataAreEmpty(allData[i], false)) {
                                Swal.fire({
                                    title: 'Unable to confirm this job.',
                                    text: `Some data are empty. You cannot confirm this group.`,
                                    icon: 'error',
                                    showCancelButton: true,
                                    showConfirmButton: false,
                                })
                                return
                            }
                        }
                    }
                    Swal.fire({
                        title: 'Are you sure?',
                        text: 'If you confirm this group you will not be able to edit it!',
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#dc3545',
                        confirmButtonText: 'Confirm',
                    }).then(result => {
                        if (result.isConfirmed) {
                            self.confirmIndividualGroup(data.ind_group_id)
                        }
                    })
                }
            }
        })

        $('#jobs_table').on('click', 'i.costs-job', function () {
            var data = jobs_table.row($(this).closest('tr')).data()
            if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
                self.Helpers.swalUserPermissionError()
                return
            }

            if (data.ind_mode == 'Personnel') {
                if (data.ind_estimate_cost == 0) {
                    Swal.fire({
                        title: 'Unable to manage group costs.',
                        text: 'There is a job with empty estimate cost inside this group. Please fill it up.',
                        icon: 'error',
                        showCancelButton: true,
                        showConfirmButton: false,
                    })
                    return
                }
                $('#personnel-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
                $('#personnel-estimate-cost').val(data.ind_estimate_cost)
                $('#personnel-id').val(data.ind_id)

                if (data.ind_actual_cost != null) {
                    $('#personnel-actual-cost').val(data.ind_actual_cost)
                    var savings = data.ind_estimate_cost - data.ind_actual_cost
                    $('#personnel-savings').val(savings)
                    $('#personnel-savings-percent').val((savings / data.ind_estimate_cost) * 100)
                } else {
                    $('#personnel-actual-cost').val('')
                    $('#personnel-savings').val('')
                    $('#personnel-savings-percent').val('')
                }

                $('#personnel-costs-modal').modal('show')
            } else {
                $('#cost-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
                $('#job_estimate_costs').val(data.ind_estimate_cost)
                $('#department').val(data.division_description)

                if (data.ind_is_grouped == 0) {
                    $('#group-cost-div').hide()
                    $('#save-costs').hide()
                } else {
                    var allData = jobs_table.rows().data()
                    for (var i = 0; i < allData.length; i++) {
                        if (allData[i].ind_group_id == data.ind_group_id) {
                            if (self.Helpers.individualDataAreEmpty(allData[i], true)) {
                                if (self.Helpers.user_role_id != 2) {
                                    self.Helpers.swalFieldsMissingError()
                                    return
                                }
                            }
                        }
                    }
                    if (self.Helpers.groupDataAreEmpty(data)) {
                        $('#saving-data').hide()
                    } else {
                        $('#saving-data').show()
                    }

                    self.initializeGroupCitySelect(data.ex_city, data.to_city)
                    if (data.ind_group_deadline == '' || data.ind_group_deadline == null) {
                        $('#group_cut_off_date').val('')
                    } else {
                        $('#group_cut_off_date').val(data.ind_group_deadline)
                    }

                    var sum_estimate_cost = data.sum_estimated_cost
                    var group_cost = data.ind_group_cost

                    var savings_percent = ((1 - group_cost / sum_estimate_cost) * 100).toFixed(2)
                    var savings_amount = ((data.ind_estimate_cost * savings_percent) / 100).toFixed(2)
                    var shared_cost = ((group_cost / sum_estimate_cost) * data.ind_estimate_cost).toFixed(2)

                    if (data.ind_group_cost == null) {
                        $('#group_cost').val('')
                    } else {
                        $('#group_cost').val(self.Helpers.revertRate(group_cost, data.ind_group_rate))
                    }

                    $('#group_id').val(data.ind_group_id)
                    $('#saving_amount').val(savings_amount)
                    $('#saving_percent').val(savings_percent)
                    $('#shared_cost').val(shared_cost)
                    self.Helpers.initCurrencyInput(data.ind_group_currency, 'group-currency')
                    $('#group_forwarder').val(data.ind_group_forwarder)
                    $('#group-cost-div').show()
                    $('#save-costs').show()
                }

                $('#costs-modal').modal('show')
            }
        })

        $('#jobs_table').on('click', 'i.delete-job', function () {
            var data = jobs_table.row($(this).closest('tr')).data()
            if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
                Swal.fire({
                    title: 'Unable to delete this job.',
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: 'error',
                    showCancelButton: true,
                    showConfirmButton: false,
                })
                return
            }
            Swal.fire({
                title: 'Delete Job?',
                text: "Are you sure you want to delete this job? You won't be able to revert it!",
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Confirm',
            }).then(result => {
                if (result.isConfirmed) {
                    self.deleteIndividual(data)
                }
            })
        })

        $('#search_datatable').keyup(function () {
            if ($(this).val() != '') {
                let regexp = `\\b${$(this).val()}`
                jobs_table.search(regexp, true, false).draw()
            } else {
                jobs_table.search('').draw()
            }
        })
    })
}

DbClass.prototype.getAllDoneIndividuals = async function () {
    let self = this
    const sql =
        'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' users.user_username,' +
        ' ind_jobs.ind_group_id,' +
        ' ind_jobs.ind_division_id,' +
        ' ind_jobs.ind_user_id,' +
        ' ind_jobs.ind_request_date as original_request_date,' +
        ' ind_jobs.ind_confirmation_date as original_confirmation_date,' +
        ' ind_jobs.ind_deadline as original_deadline,' +
        ' ind_jobs.ind_ex,' +
        ' ind_jobs.ind_to,' +
        ' ind_jobs.ind_service_type,' +
        ' ind_jobs.ind_is_grouped,' +
        ' divisions.division_description,' +
        ' ind_jobs.ind_products,' +
        ' ind_jobs.ind_mode,' +
        ' service_types.service_type_description,' +
        ' ind_jobs.ind_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' DATE_FORMAT(ind_jobs.ind_deadline, "%d/%m/%Y") as ind_deadline,' +
        ' DATE_FORMAT(ind_jobs.ind_confirmation_date, "%d/%m/%Y %H:%i:%s" ) as ind_confirmation_date,' +
        ' ind_jobs.ind_forwarder,' +
        ' ind_jobs.ind_reference,' +
        ' ind_jobs.ind_pieces,' +
        ' ind_jobs.ind_kg,' +
        ' Round(ind_jobs.ind_estimate_cost,2) as ind_estimate_cost,' +
        ' ind_jobs.ind_notes,' +
        ' individual_groups.ind_group_color,' +
        ' individual_groups.ind_group_cost,' +
        ' DATE_FORMAT(individual_groups.ind_group_deadline, "%d/%m/%Y") as ind_group_deadline,' +
        ' individual_groups.ind_group_forwarder, ' +
        ' (SELECT Round(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id AND ind_deleted = 0) as sum_estimated_cost,' +
        ' ind_jobs.ind_actual_cost,' +
        ' ind_jobs.ind_consolidated,' +
        ' ind_jobs.ind_splitted,' +
        ' ind_jobs.ind_parent,' +
        ' UNIX_TIMESTAMP(ind_jobs.ind_confirmation_date) as ind_timestamp' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = ind_jobs.ind_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = ind_jobs.ind_to' +
        ' LEFT JOIN service_types as service_types on service_types.service_type_id = ind_jobs.ind_service_type' +
        ' WHERE ind_jobs.ind_status = "Done" AND ind_deleted = 0' +
        ' ;'

    return new Promise((resolve, reject) => {
        self.mysqlConn.query(sql, function (error, data) {
            if (error) {
                alert('Unable to get done individuals')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getAllDeletedIndividuals = function () {
    let self = this

    const sql =
        'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' users.user_username,' +
        ' ind_jobs.ind_group_id,' +
        ' divisions.division_description,' +
        ' ind_jobs.ind_products,' +
        ' ind_jobs.ind_mode,' +
        ' ind_jobs.ind_mode,' +
        ' service_types.service_type_description,' +
        ' ind_jobs.ind_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' DATE_FORMAT(ind_jobs.ind_deadline, "%d/%m/%Y") as ind_deadline,' +
        ' DATE_FORMAT(ind_jobs.ind_confirmation_date, "%d/%m/%Y %H:%i:%s" ) as ind_confirmation_date,' +
        ' ind_jobs.ind_forwarder,' +
        ' ind_jobs.ind_reference,' +
        ' ind_jobs.ind_kg,' +
        ' Round(ind_jobs.ind_estimate_cost,2) as ind_estimate_cost,' +
        ' ind_jobs.ind_notes,' +
        ' individual_groups.ind_group_color,' +
        ' individual_groups.ind_group_cost,' +
        ' DATE_FORMAT(individual_groups.ind_group_deadline, "%d/%m/%Y") as ind_group_deadline,' +
        ' individual_groups.ind_group_forwarder, ' +
        ' (SELECT Round(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id AND ind_deleted = 0) as sum_estimated_cost,' +
        ' DATE_FORMAT(ind_jobs.ind_date_deleted, "%d/%m/%Y %H:%i:%s" ) as ind_date_deleted' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = ind_jobs.ind_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = ind_jobs.ind_to' +
        ' LEFT JOIN service_types as service_types on service_types.service_type_id = ind_jobs.ind_service_type' +
        ' WHERE ind_deleted = 1' +
        ' ORDER BY ind_jobs.ind_group_id DESC;'

    self.mysqlConn.query(sql, function (error, data) {
        if (error) throw error
        var dataset = []
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = []

            for (j = 0; j < values.length; j++) {
                dataset[i].push(values[j])
            }
        }

        var jobs_table = $('#deleted_individuals_table').DataTable({
            data: dataset,
            fixedHeader: {
                headerOffset: 100,
                header: true,
                footer: false,
            },
            bLengthChange: false,
            columns: [
                { title: 'JOB ID', orderable: false },
                { title: 'REQ. DATE', orderable: false },
                { title: 'USER', orderable: false },
                { title: 'GROUP', orderable: false },
                { title: 'DEPARTMENT', orderable: false },
                { title: 'PRODUCT', orderable: false },
                { title: 'MODE', orderable: false },
                { title: 'SERVICE', orderable: false },
                { title: 'VESSEL', orderable: false },
                { title: 'EX', orderable: false, className: 'danger-header' },
                { title: 'TO', orderable: false, className: 'danger-header' },
                { title: 'DEADLINE', orderable: false, className: 'danger-header' },
                { title: 'CONFIRMATION DATE', orderable: false },
                { title: 'FORWARDER', orderable: false },
                { title: 'REFERENCE', orderable: false },
                { title: 'KG', orderable: false },
                { title: 'ESTIMATE COST (€)', orderable: false },
                { title: 'NOTES', visible: false },
                { title: 'Group Color', visible: false },
                { title: 'Group Cost', visible: false },
                { title: 'GROUP DEADLINE', orderable: false },
                { title: 'GROUP FORWARDER', orderable: false },
                { title: 'Sum estimate cost', visible: false },
                { title: 'DEL.DATE', visible: true },
                // {
                //     "title": "ACTIONS", "orderable": false,
                //     "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-dollar done-job-cost action-btn' style='cursor: pointer' ></i>"
                // }
            ],
            order: [[3, 'desc']],
            pageLength: 25,
        })

        $('#search_datatable').keyup(function () {
            if ($(this).val() != '') {
                let regexp = `\\b${$(this).val()}`
                jobs_table.search(regexp, true, false).draw()
            } else {
                jobs_table.search('').draw()
            }
        })
    })
}

DbClass.prototype.updateJob = function (jobObject) {
    let self = this

    let sql =
        `UPDATE individuals SET ind_division_id = ${jobObject.ind_division_id}, ind_service_type = ${jobObject.ind_service_type}, ind_products='${jobObject.ind_products}', ind_mode='${jobObject.ind_mode}', ind_vessels='${jobObject.ind_vessels}', ind_notes = '${jobObject.ind_notes}', ind_rate = ${jobObject.ind_rate}, ind_currency = '${jobObject.ind_currency}',` +
        ` ind_ex=${jobObject.ind_ex}, ind_to=${jobObject.ind_to}, ind_deadline='${jobObject.ind_deadline}', ind_forwarder='${jobObject.ind_forwarder}', ind_reference='${jobObject.ind_reference}', ind_kg = ${jobObject.ind_kg}, ind_pieces = ${jobObject.ind_pieces}, ind_estimate_cost = ${jobObject.ind_estimate_cost},` +
        ` ind_group_id = 0 WHERE ind_id = ${jobObject.ind_id};`

    self.mysqlConn.query(sql, function (error, result) {
        if (error) {
            $('#save-job-btn').attr('disabled', null)
            alert('Unable to modify job.')
            throw error
        } else {
            $('#add-job-modal').modal('hide')
            if (jobObject.ind_mode == 'Personnel') {
                self.handleGroupForPersonnel(jobObject.ind_id)
            } else {
                self.handleIndividualGroupsUpdate(jobObject)
            }
        }
    })
}

DbClass.prototype.deleteIndividual = function (individualData) {
    let self = this

    var sql = 'UPDATE individuals set ind_deleted = 1, ind_date_deleted = now() WHERE ind_id = ' + individualData.ind_id + ';'

    self.mysqlConn.query(sql, function (error) {
        if (error) {
            throw error
        }
        if (individualData.ind_is_grouped === 1) {
            //the individual was grouped
            console.log('Individual was grouped.....')
            self.checkIfThereIsOneJobAloneGrouped()
        } else {
            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear()
            $('#jobs_table').DataTable().destroy()
            self.Helpers.toastr('success', 'Job deleted successfully.')
            self.getAllIndividuals()
        }
    })
}

DbClass.prototype.addIndividual = function (indObj) {
    let self = this

    let sql =
        `INSERT INTO individuals (ind_user_id, ind_division_id, ind_products, ind_mode, ind_vessels, ind_ex, ind_to, ind_request_date, ind_deadline, ind_forwarder, ind_status, ind_reference, ind_kg, ind_estimate_cost, ind_notes, ind_service_type, ind_pieces, ind_deleted, ind_rate, ind_currency)` +
        ` VALUES (${indObj.ind_user_id}, ${indObj.ind_division_id}, '${indObj.ind_products}', '${indObj.ind_mode}', '${indObj.ind_vessels}', '${
            indObj.ind_ex
        }', '${indObj.ind_to}', '${self.Helpers.getDateTimeNow()}', '${indObj.ind_deadline}', '${indObj.ind_forwarder}', 'Pending', '${
            indObj.ind_reference
        }', ${indObj.ind_kg}, ${indObj.ind_estimate_cost}, '${indObj.ind_notes}', ${indObj.ind_service_type}, ${indObj.ind_pieces}, 0, ${
            indObj.ind_rate
        }, '${indObj.ind_currency}');`

    self.mysqlConn.query(sql, function (error, result) {
        if (error) {
            $('#save-job-btn').attr('disabled', null)
            self.Helpers.toastr('error', 'Unable to add this job.')
            throw error
        } else {
            $('#add-job-modal').modal('hide')
            if (indObj.ind_mode == 'Personnel') {
                self.handleGroupForPersonnel(result.insertId)
            } else {
                self.handleIndividualGroups(indObj, result.insertId)
            }
        }
    })
}

DbClass.prototype.confirmIndividualGroup = function (groupID) {
    let self = this

    var sql =
        'UPDATE individuals SET ' +
        'ind_status = "Done", ' +
        'ind_confirmation_date = "' +
        self.Helpers.getDateTimeNow() +
        '"' +
        ' WHERE ind_group_id = ' +
        groupID +
        ' AND ind_deleted = 0; UPDATE individual_groups SET ind_group_active = 0, ind_group_confirmation_date = "' +
        self.Helpers.getDateTimeNow() +
        '" WHERE ind_group_id = ' +
        groupID

    self.mysqlConn.query(sql, function (error, result) {
        if (error) {
            alert('Unable to confirm job.')
            throw error
        } else {
            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear()
            $('#jobs_table').DataTable().destroy()
            self.Helpers.toastr('success', 'Job confirmed successfully.')
            self.getAllIndividuals()
        }
    })
}

DbClass.prototype.confirmPersonnel = function (personnelID) {
    let self = this

    var sql =
        'UPDATE individuals SET ' +
        'ind_status = "Done", ' +
        'ind_confirmation_date = "' +
        self.Helpers.getDateTimeNow() +
        '"' +
        ' WHERE ind_id = ' +
        personnelID +
        ' AND ind_deleted = 0;'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    connection.connect()

    connection.query(sql, function (error, result) {
        if (error) {
            alert('Unable to confirm job.')
            throw error
        } else {
            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear()
            $('#jobs_table').DataTable().destroy()
            self.Helpers.toastr('success', 'Job confirmed successfully.')
            self.getAllIndividuals()
        }
    })

    connection.end()
}

DbClass.prototype.handleIndividualGroups = function (individualData, insertedID) {
    let self = this

    var sql =
        'SELECT * FROM individual_groups WHERE ' +
        'ind_group_ex = "' +
        individualData.ind_ex +
        '" AND ' +
        'ind_group_to = "' +
        individualData.ind_to +
        '" AND ' +
        'ind_group_deadline = "' +
        individualData.ind_deadline +
        '" AND ' +
        'ind_group_active = 1'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error, groupResults) {
        if (error) {
            alert('Unable to manage groups.')
            throw error
        } else {
            if (groupResults.length == 0) {
                var insert_sql =
                    'INSERT INTO individual_groups ' +
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_deadline, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex +
                    '", "' +
                    individualData.ind_to +
                    '", "' +
                    individualData.ind_deadline +
                    '", 1)'

                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true,
                })
                insertConnection.query(insert_sql, function (error, insertResult) {
                    if (error) {
                        throw error
                    } else {
                        var new_sql =
                            'UPDATE individuals set ind_group_id = ' + insertResult.insertId + ', ind_is_grouped = 0 WHERE ind_id = ' + insertedID

                        var newConnection = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                        })
                        newConnection.query(new_sql, function (error) {
                            if (error) throw error
                            self.checkIfThereIsOneJobAloneGrouped()
                        })

                        newConnection.end()
                    }
                })

                insertConnection.end()
            } else {
                if (groupResults[0].ind_group_color == 'empty') {
                    var randomNumber = Math.floor(Math.random() * (self.colors.length - 1))

                    var updateGroups =
                        'UPDATE individual_groups SET ind_group_color = "' +
                        self.colors[randomNumber].color_code +
                        '" WHERE ind_group_id = ' +
                        groupResults[0].ind_group_id

                    var updateConnections = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true,
                    })
                    updateConnections.query(updateGroups, function (error) {
                        if (error) {
                            throw error
                        } else {
                            var new_sql =
                                'UPDATE individuals set ind_group_id = ' +
                                groupResults[0].ind_group_id +
                                ' WHERE ind_id = ' +
                                insertedID +
                                ';' +
                                'UPDATE individuals set ind_is_grouped = 1 WHERE ind_group_id = ' +
                                groupResults[0].ind_group_id

                            var newConnection = mysql.createConnection({
                                host: self.serverIP,
                                user: self.user,
                                password: self.dbpass,
                                database: self.database,
                                port: self.port,
                                dateStrings: true,
                                multipleStatements: true,
                            })
                            newConnection.query(new_sql, function (error) {
                                if (error) throw error
                                self.checkIfThereIsOneJobAloneGrouped()
                            })

                            newConnection.end()
                        }
                    })

                    updateConnections.end()
                } else {
                    var new_sql =
                        'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ', ind_is_grouped = 1 WHERE ind_id = ' + insertedID

                    var newConnection = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true,
                    })
                    newConnection.query(new_sql, function (error) {
                        if (error) throw error
                        self.checkIfThereIsOneJobAloneGrouped()
                    })

                    newConnection.end()
                }
            }
        }
    })

    connection.end()
}

DbClass.prototype.saveNotesChanges = function (jobID, noteText) {
    let self = this

    var sql = 'UPDATE individuals SET ' + 'ind_notes = "' + noteText + '" ' + ' WHERE ind_id = ' + jobID

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error, result) {
        if (error) {
            alert('Unable to modify notes.')
            throw error
        } else {
            $('#notes-modal').modal('hide')
            $('#done_individuals_table').unbind('click')
            $('#done_individuals_table').DataTable().clear()
            $('#done_individuals_table').DataTable().destroy()
            self.getAllDoneIndividuals()
        }
    })

    connection.end()
}

DbClass.prototype.handleIndividualGroupsUpdate = function (individualData) {
    let self = this

    var sql =
        'SELECT *, ' +
        '(Select count(*) FROM individuals WHERE ind_group_id = individual_groups.ind_group_id AND ind_status = "Pending") as individual_count' +
        ' FROM individual_groups WHERE ' +
        'ind_group_ex = "' +
        individualData.ind_ex +
        '" AND ' +
        'ind_group_to = "' +
        individualData.ind_to +
        '" AND ' +
        'ind_group_deadline = "' +
        individualData.ind_deadline +
        '" AND ' +
        'ind_group_active = 1'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()
    connection.query(sql, function (error, groupResults) {
        if (error) {
            alert('Unable to manage groups.')
            throw error
        } else {
            if (groupResults.length == 0) {
                var insert_sql =
                    'INSERT INTO individual_groups ' +
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_deadline, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex +
                    '", "' +
                    individualData.ind_to +
                    '", "' +
                    individualData.ind_deadline +
                    '", 1)'

                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true,
                })
                insertConnection.query(insert_sql, function (error, insertResult) {
                    if (error) {
                        alert('Unable to manage groups.')
                        throw error
                    } else {
                        var new_sql =
                            'UPDATE individuals set ind_group_id = ' +
                            insertResult.insertId +
                            ', ind_is_grouped = 0 WHERE ind_id = ' +
                            individualData.ind_id

                        var newConnection = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                        })
                        newConnection.query(new_sql, function (error) {
                            if (error) throw error
                            self.checkIfThereIsOneJobAloneGrouped()
                        })

                        newConnection.end()
                    }
                })

                insertConnection.end()
            } else {
                if (groupResults[0].ind_group_color == 'empty') {
                    if (groupResults[0].individual_count != 0) {
                        var randomNumber = Math.floor(Math.random() * 29) + 1

                        var updateGroups =
                            'UPDATE individual_groups SET ind_group_color = "' +
                            self.colors[randomNumber].color_code +
                            '" WHERE ind_group_id = ' +
                            groupResults[0].ind_group_id

                        var updateConnections = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                        })
                        updateConnections.query(updateGroups, function (error) {
                            if (error) {
                                throw error
                            } else {
                                var new_sql =
                                    'UPDATE individuals set ind_group_id = ' +
                                    groupResults[0].ind_group_id +
                                    ', ind_is_grouped = 1 WHERE ind_id = ' +
                                    individualData.ind_id +
                                    ';' +
                                    'UPDATE individuals set ind_is_grouped = 1 WHERE ind_group_id = ' +
                                    groupResults[0].ind_group_id

                                var newConnection = mysql.createConnection({
                                    host: self.serverIP,
                                    user: self.user,
                                    password: self.dbpass,
                                    database: self.database,
                                    port: self.port,
                                    dateStrings: true,
                                    multipleStatements: true,
                                })
                                newConnection.query(new_sql, function (error) {
                                    if (error) throw error
                                    self.checkIfThereIsOneJobAloneGrouped()
                                })

                                newConnection.end()
                            }
                        })

                        updateConnections.end()
                    } else {
                        var ungroup_sql =
                            'UPDATE individuals set ind_group_id = ' +
                            groupResults[0].ind_group_id +
                            ', ind_is_grouped = 0 WHERE ind_id = ' +
                            individualData.ind_id +
                            ';'

                        var ungrouConn = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                            multipleStatements: false,
                        })
                        ungrouConn.query(ungroup_sql, function (error) {
                            if (error) throw error
                            self.checkIfThereIsOneJobAloneGrouped()
                        })

                        ungrouConn.end()
                    }
                } else {
                    var new_sql =
                        'UPDATE individuals set ind_group_id = ' +
                        groupResults[0].ind_group_id +
                        ', ind_is_grouped = 1 WHERE ind_id = ' +
                        individualData.ind_id +
                        ';'

                    var newConnection = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true,
                        multipleStatements: false,
                    })
                    newConnection.query(new_sql, function (error) {
                        if (error) throw error
                        self.checkIfThereIsOneJobAloneGrouped()
                    })

                    newConnection.end()
                }
            }
        }
    })

    connection.end()
}

DbClass.prototype.checkIfThereIsOneJobAloneGrouped = function () {
    let self = this
    var mysql = require('mysql')
    var check_sql =
        'Select ind_group_id, count(*) as ind_count from individuals ' +
        'WHERE ind_is_grouped = 1 AND ind_status = "Pending" AND ind_mode != "Personnel"  AND ind_deleted = 0 ' +
        'group by ind_group_id;'

    var newConnection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })
    newConnection.query(check_sql, function (error, individuals) {
        if (error) throw error

        for (i = 0; i < individuals.length; i++) {
            if (individuals[i].ind_count == 1) {
                console.log(individuals[i].ind_group_id)
                var ungroup_sql =
                    'UPDATE individual_groups SET ind_group_color = "empty" WHERE ind_group_id = ' +
                    individuals[i].ind_group_id +
                    ';' +
                    'UPDATE individuals set ind_is_grouped = 0 WHERE ind_group_id = ' +
                    individuals[i].ind_group_id +
                    '; '

                var ungrouConn = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true,
                    multipleStatements: true,
                })
                ungrouConn.query(ungroup_sql, function (error) {
                    if (error) throw error
                    $('#jobs_table').unbind('click')
                    $('#jobs_table').DataTable().clear()
                    $('#jobs_table').DataTable().destroy()
                    self.Helpers.toastr('success', 'Job added successfully.')
                    self.getAllIndividuals()
                })

                ungrouConn.end()
            }
        }
        $('#jobs_table').unbind('click')
        $('#jobs_table').DataTable().clear()
        $('#jobs_table').DataTable().destroy()
        self.Helpers.toastr('success', 'Job added successfully.')
        self.getAllIndividuals()
    })

    newConnection.end()
}

DbClass.prototype.updateGroupCost = function (groupCostData) {
    let self = this

    const sql =
        `UPDATE individual_groups SET ind_group_cost= ${groupCostData.ind_group_cost}, ind_group_deadline='${groupCostData.ind_group_deadline}', ind_group_forwarder='${groupCostData.ind_group_forwarder}', ind_group_to = ${groupCostData.ind_group_to}, ind_group_active = ${groupCostData.ind_group_active},` +
        ` ind_group_rate = ${groupCostData.ind_group_rate}, ind_group_currency = '${groupCostData.ind_group_currency}' WHERE ind_group_id = ${groupCostData.ind_group_id};` +
        `UPDATE individuals SET ind_ex = ${groupCostData.ind_group_ex}, ind_to = ${groupCostData.ind_group_to}, ind_deadline = '${groupCostData.ind_group_deadline}' WHERE ind_group_id = ${groupCostData.ind_group_id};`

    self.mysqlConn.query(sql, function (error) {
        if (error) {
            alert('Unable to update job cost')
            throw error
        }
        var searchIndSql =
            'Select * from individuals WHERE ind_ex = ' +
            groupCostData.ind_group_ex +
            ' AND ind_to = ' +
            groupCostData.ind_group_to +
            ' AND ind_deadline = "' +
            groupCostData.ind_group_deadline +
            '" AND ind_group_id != ' +
            groupCostData.ind_group_id +
            ' AND ind_deleted = 0 AND ind_status = "Pending" AND ind_estimate_cost != 0 AND ind_mode != "Personnel"'

        var mysql = require('mysql')

        var indConnection = mysql.createConnection({
            host: self.serverIP,
            user: self.user,
            password: self.dbpass,
            database: self.database,
            port: self.port,
            dateStrings: true,
        })

        indConnection.connect()
        indConnection.query(searchIndSql, function (error, indToChangeGroup) {
            if (error) {
                alert('Unable to update job cost')
                throw error
            } else {
                for (let i = 0; i < indToChangeGroup.length; i++) {
                    var changeIndividualSql =
                        'UPDATE individuals SET ind_is_grouped = 1, ind_group_id = ' +
                        groupCostData.ind_group_id +
                        ' WHERE ind_id = ' +
                        indToChangeGroup[i].ind_id +
                        ';' +
                        ' DELETE FROM individual_groups WHERE ind_group_id = ' +
                        indToChangeGroup[i].ind_group_id

                    var mysql = require('mysql')

                    var indGrpConn = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true,
                        multipleStatements: true,
                    })
                    indGrpConn.connect()
                    indGrpConn.query(changeIndividualSql, function (error) {
                        if (error) {
                            alert('Unable to update job cost')
                            throw error
                        }
                    })
                }
                $('#costs-modal').modal('hide')
                $('#jobs_table').unbind('click')
                $('#jobs_table').DataTable().clear()
                $('#jobs_table').DataTable().destroy()
                self.Helpers.toastr('success', 'Costs updated successfully.')
                self.getAllIndividuals()
            }
        })
        indConnection.end()
    })
}

DbClass.prototype.emptyDeletedIndividuals = function () {
    let self = this

    var sql = 'DELETE FROM individuals WHERE ind_deleted = 1;'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }

        window.location.reload()
    })
    connection.end()
}

DbClass.prototype.handleGroupForPersonnel = function (individualId) {
    let self = this

    var updateInd = 'UPDATE individuals SET ind_group_id = 0, ind_is_grouped = 0 WHERE ind_id = ' + individualId + ';'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(updateInd, function (error, result) {
        if (error) {
            self.Helpers.toastr('error', 'Unable to manage personnel Group.')
            throw error
        } else {
            $('#add-job-modal').modal('hide')
            self.checkIfThereIsOneJobAloneGrouped()
        }
    })
}

DbClass.prototype.updatePersonnelCosts = function (personnelId, personnelActualCost) {
    let self = this

    var updateActualCost = 'UPDATE individuals SET ind_actual_cost = ' + personnelActualCost + ' WHERE ind_id = ' + personnelId + ';'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(updateActualCost, function (error) {
        if (error) {
            throw error
        }
        $('#personnel-costs-modal').modal('hide')
        $('#jobs_table').unbind('click')
        $('#jobs_table').DataTable().clear()
        $('#jobs_table').DataTable().destroy()

        self.Helpers.toastr('success', 'Costs updated successfully.')
        self.getAllIndividuals()
    })
    connection.end()
}

DbClass.prototype.getConGroups = function () {
    var mysql = require('mysql')
    let self = this
    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    var sql = `SELECT
        cg.*,
        c.city_name as city_name,
        (SELECT con_vessels FROM consolidations WHERE con_group_id = cg.con_group_id ORDER BY con_id LIMIT 1) as vessel
        FROM consolidation_groups cg
        LEFT JOIN cities c on c.city_id = cg.con_group_ex
        WHERE cg.con_group_active = 1;`
    connection.connect()
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, data) {
            connection.end()
            if (error) {
                alert('Unable to get consolidation groups.')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.assignJobsToNewGroup = async function (selectedIds) {
    var mysql = require('mysql')
    let self = this
    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    const inds = await new Promise((resolve, reject) => {
        let sql = `SELECT * FROM individuals WHERE ind_id IN (${selectedIds.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Error on SELECT individuals')
                reject(err)
            }
            resolve(data)
        })
    })
    let randomNumber = Math.floor(Math.random() * (self.colors.length - 1))
    const newConGroup = await new Promise(function (resolve, reject) {
        let sql = `INSERT INTO consolidation_groups (con_group_color, con_group_ex, con_group_active, con_group_currency, con_group_rate) 
                    VALUES ('${self.colors[randomNumber].color_code}', ${inds[0].ind_to}, 1, 'EUR', 1)`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Error on INSERT consolidation_groups')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    if (typeof newConGroup.insertId === 'undefined') {
        alert('Cannot add consolidation group')
        return
    }
    let conAdded = await new Promise(function (resolve, reject) {
        let sql = ''
        for (let ind of inds) {
            let typeText = ''
            if (ind.ind_service_type == self.Helpers.LOCAL_SERVICE_TYPE_ID) {
                typeText = self.Helpers.LOCAL_SERVICE_TYPE_TEXT
            } else {
                ind.ind_is_grouped == 1 ? (typeText = 'Grouped') : (typeText = 'Individual')
            }
            sql = `INSERT INTO consolidations (con_ind_id, con_user_id, con_division_id, con_products, con_vessels, con_reference, con_kg, con_status, con_request_date, con_group_id, con_pieces, con_is_grouped, con_type)
                    VALUES (${ind.ind_id}, ${self.Helpers.user_id}, ${ind.ind_division_id}, '${ind.ind_products}', '${ind.ind_vessels}', '${ind.ind_reference}', ${ind.ind_kg}, 'Pending', now(), ${newConGroup.insertId}, ${ind.ind_pieces}, ${ind.ind_is_grouped}, '${typeText}');`
            connection.query(sql, (err, data) => {
                if (err) {
                    alert('Unable to add consolidations')
                    console.log(err)
                    reject(err)
                }
            })
        }
        resolve(true)
    })
    if (!conAdded) {
        alert('Cannot add consolidations')
        return
    }
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE individuals set ind_consolidated = 1 WHERE ind_id IN (${selectedIds.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('ERROR on UPDATE individuals')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    connection.end()
    window.location.replace('consolidations.html')
}

DbClass.prototype.assignJobsToConGroup = async function (selGroup, doneIds) {
    let self = this

    const inds = await new Promise((resolve, reject) => {
        let sql = `SELECT * FROM individuals WHERE ind_id IN (${doneIds.join(',')})`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('ERROR on SELECT individuals')
                reject(err)
            }
            resolve(data)
        })
    })
    let conAdded = await new Promise(function (resolve, reject) {
        let sql = ''
        for (let ind of inds) {
            let typeText = ''
            if (ind.ind_service_type == self.Helpers.LOCAL_SERVICE_TYPE_ID) {
                typeText = self.Helpers.LOCAL_SERVICE_TYPE_TEXT
            } else {
                ind.ind_is_grouped == 1 ? (typeText = 'Grouped') : (typeText = 'Individual')
            }
            sql = `INSERT INTO consolidations (con_ind_id, con_user_id, con_division_id, con_products, con_vessels, con_reference, con_kg, con_status, con_request_date, con_group_id, con_pieces, con_is_grouped, con_type)
                    VALUES (${ind.ind_id}, ${self.Helpers.user_id}, ${ind.ind_division_id}, '${ind.ind_products}', '${ind.ind_vessels}', '${ind.ind_reference}', ${ind.ind_kg}, 'Pending', now(), ${selGroup}, ${ind.ind_pieces}, ${ind.ind_is_grouped}, '${typeText}');`
            self.mysqlConn.query(sql, (err, data) => {
                if (err) {
                    alert('Unable to add consolidations')
                    console.log(err)
                    reject(err)
                }
            })
        }
        resolve(true)
    })
    if (!conAdded) {
        alert('Cannot add consolidations')
        return
    }
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE individuals set ind_consolidated = 1 WHERE ind_id IN (${doneIds.join(',')})`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update consolidations done')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    window.location.replace('consolidations.html')
}

DbClass.prototype.assignConJobsToNewGroup = async function (jobs) {
    var mysql = require('mysql')
    let self = this
    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    const cons = await new Promise((resolve, reject) => {
        let sql = `SELECT 
        cd.* ,
        cg.con_group_to as group_to
        FROM consolidations_done cd
        JOIN consolidation_groups cg on cg.con_group_id = cd.cond_group_id 
        WHERE cd.cond_id IN (${jobs.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get consolidations')
                reject(err)
            }
            resolve(data)
        })
    })
    let randomNumber = Math.floor(Math.random() * (self.colors.length - 1))
    const newConGroup = await new Promise(function (resolve, reject) {
        let sql = `INSERT INTO consolidation_groups (con_group_color, con_group_ex, con_group_active, con_group_currency, con_group_rate) 
                    VALUES ('${self.colors[randomNumber].color_code}', ${cons[0].group_to}, 1 , 'EUR', 1)`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Unable to add consolidations done')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    if (typeof newConGroup.insertId === 'undefined') {
        alert('Cannot add consolidation group')
        return
    }
    let conAdded = await new Promise(function (resolve, reject) {
        let sql = ''
        for (let con of cons) {
            sql = `INSERT INTO consolidations (con_ind_id, con_done_id, con_user_id, con_division_id, con_products, con_vessels, con_reference, con_kg, con_status, con_request_date, con_group_id, con_pieces, con_type)
                    VALUES (${con.cond_ind_id}, ${con.cond_id}, ${self.Helpers.user_id}, ${con.cond_division_id}, '${con.cond_products}', '${con.cond_vessels}', '${con.cond_reference}', ${con.cond_kg}, 'Pending', now(), ${newConGroup.insertId}, ${con.cond_pieces}, '${self.Helpers.LOCAL_SERVICE_TYPE_TEXT}');`
            connection.query(sql, (err, data) => {
                if (err) {
                    alert('Unable to add consolidations')
                    console.log(err)
                    reject(err)
                }
            })
        }
        resolve(true)
    })
    if (!conAdded) {
        alert('Cannot add consolidations')
        return
    }
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done set cond_consolidated = 1 WHERE cond_id IN (${jobs.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update consolidations done')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    connection.end()
    window.location.replace('consolidations.html')
}

DbClass.prototype.assignConJobsToConGroup = async function (selGroup, jobs) {
    var mysql = require('mysql')
    let self = this
    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    const cons = await new Promise((resolve, reject) => {
        let sql = `SELECT 
        cd.* ,
        cg.con_group_ex as group_ex
        FROM consolidations_done cd
        JOIN consolidation_groups cg on cg.con_group_id = cd.cond_group_id 
        WHERE cd.cond_id IN (${jobs.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get consolidations')
                reject(err)
            }
            resolve(data)
        })
    })
    let conAdded = await new Promise(function (resolve, reject) {
        let sql = ''
        for (let con of cons) {
            sql = `INSERT INTO consolidations (con_ind_id, con_done_id, con_user_id, con_division_id, con_products, con_vessels, con_reference, con_kg, con_status, con_request_date, con_group_id, con_pieces, con_type)
                    VALUES (${con.cond_ind_id}, ${con.cond_id}, ${self.Helpers.user_id}, ${con.cond_division_id}, '${con.cond_products}', '${con.cond_vessels}', '${con.cond_reference}', ${con.cond_kg}, 'Pending', now(), ${selGroup}, ${con.cond_pieces}, '${self.Helpers.LOCAL_SERVICE_TYPE_TEXT}');`
            connection.query(sql, (err, data) => {
                if (err) {
                    alert('Unable to add consolidations')
                    console.log(err)
                    reject(err)
                }
            })
        }
        resolve(true)
    })
    if (!conAdded) {
        alert('Cannot add consolidations')
        return
    }
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done set cond_consolidated = 1 WHERE cond_id IN (${jobs.join(',')})`
        connection.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update consolidations done')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    connection.end()
    window.location.replace('consolidations.html')
}
/**************** END OF INDIVIDUALS ***********************/

/**************** MANAGE DATA ***********************/

DbClass.prototype.addServiceType = function (serviceTypeData) {
    let self = this

    var sql = `INSERT INTO service_types (service_type_description, service_type_group) VALUES ('${serviceTypeData.service_type_description}', '${serviceTypeData.service_type_group}');`

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            alert('Unable to add service...')
            throw error
        } else {
            self.Helpers.toastr('success', 'Service added successfully.')
            setTimeout(function () {
                window.location.reload()
            }, 2000)
        }
    })

    connection.end()
}

DbClass.prototype.deleteServiceType = function (service_type_id) {
    let self = this

    var sql = 'UPDATE service_types SET service_type_deleted = 1 WHERE service_type_id = ' + service_type_id + ' LIMIT 1;'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }
        self.Helpers.toastr('success', 'Service deleted')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}

DbClass.prototype.updateServiceType = function (serviceTypeData) {
    let self = this

    var sql = `UPDATE service_types SET service_type_description='${serviceTypeData.service_type_description}',  service_type_group='${serviceTypeData.service_type_group}' WHERE service_type_id=${serviceTypeData.service_type_id}`

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }
        self.Helpers.toastr('success', 'Service updated')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}

DbClass.prototype.addCity = function (cityName) {
    let self = this

    var sql = 'INSERT INTO cities (city_name) VALUES ("' + cityName + '");'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            alert('Unable to add city.')
            throw error
        } else {
            self.Helpers.toastr('success', 'City added successfully.')
            setTimeout(function () {
                window.location.reload()
            }, 2000)
        }
    })

    connection.end()
}

DbClass.prototype.deleteCity = function (city_id) {
    let self = this

    var sql = 'UPDATE cities SET city_deleted = 1 WHERE city_id = ' + city_id + ' LIMIT 1;'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }

        self.Helpers.toastr('success', 'City deleted')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}

DbClass.prototype.updateCity = function (cityData) {
    let self = this

    var sql = `UPDATE cities SET city_name = '${cityData.city_name}' WHERE city_id = ${cityData.city_id};`

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }

        self.Helpers.toastr('success', 'City updated')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}
DbClass.prototype.addVessel = function (vesselName) {
    let self = this

    var sql = 'INSERT INTO vessels (vessel_description) VALUES ("' + vesselName + '");'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            alert('Unable to add vessel.')
            throw error
        } else {
            self.Helpers.toastr('success', 'Vessel added successfully.')
            setTimeout(function () {
                window.location.reload()
            }, 2000)
        }
    })

    connection.end()
}
DbClass.prototype.updateVessel = function (vesselData) {
    let self = this

    var sql = `UPDATE vessels SET vessel_description = '${vesselData.vessel_description}' WHERE vessel_id = ${vesselData.vessel_id} LIMIT 1;`

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }

        self.Helpers.toastr('success', 'Vessel updated')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}

DbClass.prototype.deleteVessel = function (vessel_id) {
    let self = this

    var sql = 'UPDATE vessels SET vessel_deleted = 1 WHERE vessel_id = ' + vessel_id + ' LIMIT 1;'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error) {
        if (error) {
            throw error
        }
        self.Helpers.toastr('success', 'Vessel deleted')
        setTimeout(function () {
            window.location.reload()
        }, 2000)
    })
    connection.end()
}
/**************** END OF MANAGE DATA ***********************/

/**************** MANAGER ***********************/

DbClass.prototype.getManagerData = function (fromDate, toDate) {
    let self = this

    var sql =
        'Select ' +
        'divisions.division_id, ' +
        'divisions.division_description, ' +
        'ind_jobs.ind_estimate_cost, ' +
        'ind_jobs.ind_group_id, ' +
        'ind_jobs.ind_is_grouped, ' +
        'ind_groups.ind_group_cost, ' +
        '(SELECT sum(individuals.ind_estimate_cost) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id) as individuals_estimated_cost ' +
        'FROM individuals as ind_jobs ' +
        'JOIN individual_groups as ind_groups on ind_groups.ind_group_id = ind_jobs.ind_group_id ' +
        'JOIN divisions as divisions on divisions.division_id = ind_jobs.ind_division_id ' +
        'WHERE ind_jobs.ind_status = "Done" AND ind_jobs.ind_confirmation_date BETWEEN "' +
        self.Helpers.changeDateToMysql(fromDate) +
        '" AND "' +
        self.Helpers.changeDateToMysql(toDate, 1) +
        '";'

    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()

    connection.query(sql, function (error, ind_result) {
        if (error) {
            throw error
            connection.end()
        }

        var con_sql =
            'Select ' +
            'divisions.division_id, ' +
            'divisions.division_description, ' +
            'cons.con_chargable_weight, ' +
            'cons.con_group_id, ' +
            'con_groups.con_group_cost, ' +
            '(SELECT sum(consolidations.con_chargable_weight) FROM consolidations WHERE con_group_id = cons.con_group_id) as consolidation_group_weight ' +
            ' from consolidations as cons ' +
            ' JOIN consolidation_groups as con_groups on cons.con_group_id = con_groups.con_group_id ' +
            ' JOIN divisions as divisions on divisions.division_id = cons.con_division_id ' +
            ' WHERE cons.con_status = "Done" AND cons.con_confirmation_date BETWEEN "' +
            self.Helpers.changeDateToMysql(fromDate) +
            '" and "' +
            self.Helpers.changeDateToMysql(toDate) +
            '";'

        connection.query(con_sql, function (error, con_result) {
            if (error) throw error

            self.initializeManagerTable(ind_result, con_result)
        })
        connection.end()
    })
}

DbClass.prototype.initializeManagerTable = function (indData, conData) {
    let self = this

    var dataset = []
    var total_estimate_cost = 0
    var total_shared_cost = 0
    var total_individual_cost = 0
    var total_con_cost = 0
    var total_grouped_cost = 0

    //full summaries for last line
    var estimateCostSum = 0
    var totalCostSum = 0

    console.log(indData)
    console.log(conData)
    for (i = 0; i < self.divisions.length; i++) {
        dataset[i] = []
        dataset[i].push(self.divisions[i].division_description)
        var division_cost = 0
        var division_con_cost = 0
        var division_ind_cost = 0
        var division_estimate_cost = 0
        var division_shared_cost = 0
        var division_savings = 0

        for (j = 0; j < indData.length; j++) {
            if (indData[j].division_id == self.divisions[i].division_id) {
                if (indData[j].ind_is_grouped == 0) {
                    division_ind_cost = division_ind_cost + indData[j].ind_estimate_cost
                } else {
                    division_estimate_cost = division_estimate_cost + indData[j].ind_estimate_cost
                    var sum_estimate_cost = indData[j].individuals_estimated_cost
                    var group_cost = indData[j].ind_group_cost

                    var savings_percent = ((1 - group_cost / sum_estimate_cost) * 100).toFixed(2)

                    var savings_amount = (parseFloat(indData[j].ind_estimate_cost) * savings_percent) / 100
                    var shared_cost = (group_cost / sum_estimate_cost) * parseFloat(indData[j].ind_estimate_cost)

                    division_shared_cost = division_shared_cost + shared_cost
                    division_cost = parseFloat(division_cost) + shared_cost
                    division_savings = parseFloat(division_savings) + savings_amount
                }
            }
        }

        for (j = 0; j < conData.length; j++) {
            if (conData[j].division_id == self.divisions[i].division_id) {
                var sum_chargable_weight = parseFloat(conData[j].consolidation_group_weight)
                var chargable_weight = parseFloat(conData[j].con_chargable_weight)

                var jobCost = (chargable_weight / sum_chargable_weight) * parseFloat(conData[j].con_group_cost)

                division_con_cost = parseFloat(division_con_cost) + jobCost
            }
        }
        dataset[i].push(division_estimate_cost.toFixed(2) + ' €')
        dataset[i].push(division_shared_cost.toFixed(2) + ' €')

        if (division_shared_cost == 0 || division_estimate_cost == 0) {
            var finalSavingPercent = 0.0
        } else {
            var finalSavingPercent = (100 - (division_shared_cost / division_estimate_cost) * 100).toFixed(2)
        }

        dataset[i].push(finalSavingPercent + ' %')
        dataset[i].push(division_savings.toFixed(2) + ' €')
        dataset[i].push(division_ind_cost.toFixed(2) + ' €')
        dataset[i].push(division_con_cost.toFixed(2) + ' €')
        dataset[i].push((division_ind_cost + division_con_cost + division_shared_cost).toFixed(2) + ' €')
        total_estimate_cost = parseFloat(total_estimate_cost) + division_ind_cost + division_con_cost + division_estimate_cost
        total_shared_cost = parseFloat(total_shared_cost) + division_con_cost + division_ind_cost + division_shared_cost

        total_individual_cost = parseFloat(total_individual_cost) + division_ind_cost
        total_con_cost = parseFloat(total_con_cost) + division_con_cost
        total_grouped_cost = parseFloat(total_grouped_cost) + division_shared_cost

        //Calculations for totals
        estimateCostSum = parseFloat(estimateCostSum) + division_estimate_cost
        totalCostSum = parseFloat(totalCostSum) + division_ind_cost + division_con_cost + division_shared_cost
    }
    dataset[9] = []
    dataset[9].push('<b>Totals €</b>')
    dataset[9].push('<b>' + estimateCostSum.toFixed(2) + ' €' + '</b>')
    dataset[9].push('<b>' + total_grouped_cost.toFixed(2) + ' €' + '</b>')
    dataset[9].push('<b>' + (((estimateCostSum - total_grouped_cost) / estimateCostSum) * 100).toFixed(2) + ' %' + '</b>')
    dataset[9].push('<b>' + (estimateCostSum - total_grouped_cost).toFixed(2) + ' €' + '</b>')
    dataset[9].push('<b>' + total_individual_cost.toFixed(2) + ' €' + '</b>')
    dataset[9].push('<b>' + total_con_cost.toFixed(2) + ' €' + '</b>')
    dataset[9].push('<b>' + totalCostSum.toFixed(2) + ' €' + '</b>')
    var savingAmount = total_estimate_cost - total_shared_cost
    var savinPercent = (savingAmount / total_estimate_cost) * 100

    $('#total_costs_per_period').html('€ ' + total_estimate_cost.toFixed(2))
    $('#total_savings_per_period').html('€ ' + total_shared_cost.toFixed(2))
    $('#savings_percentage').html(savinPercent.toFixed(2) + ' %')
    $('#savings_amount').html('€ ' + savingAmount.toFixed(2))
    $('#general-data-div').show()

    var manager_table = $('#manager_data_table').DataTable({
        data: dataset,
        searching: false,
        paging: false,
        bInfo: false,
        bLengthChange: false,
        columns: [
            { title: 'Department', orderable: false },
            {
                title: 'Estimate cost (€)',
                orderable: false,
                className: 'success-header',
            },
            { title: 'Group Cost (€)', orderable: false, className: 'success-header' },
            { title: 'Savings %', orderable: false, className: 'success-header' },
            { title: 'Savings €', orderable: false, className: 'success-header' },
            { title: 'Individual (€)', orderable: false, className: 'danger-header' },
            {
                title: 'Consolidation €',
                orderable: false,
                className: 'warning-header',
            },
            { title: 'Total Cost €', orderable: false },
        ],
        pageLength: 25,
        order: [[0, 'asc']],
    })

    var total_individual_cost_per = (total_individual_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100
    var total_con_cost_per = (total_con_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100
    var total_grouped_cost_per = (total_grouped_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100

    var myPie = document.getElementById('manager-pie').getContext('2d')

    var pieData = {
        datasets: [
            {
                data: [total_individual_cost.toFixed(2), total_con_cost.toFixed(2), total_grouped_cost.toFixed(2)],
                backgroundColor: ['#f65f6e', '#F8BC34', '#68bb69'],
            },
        ],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Individual (' + total_individual_cost_per.toFixed(2) + '%)',
            'Consolidation (' + total_con_cost_per.toFixed(2) + '%)',
            'Grouped (' + total_grouped_cost_per.toFixed(2) + '%)',
        ],
    }

    if (self.pieCreated == true) {
        myPieChart.destroy()
    }
    myPieChart = new Chart(myPie, {
        type: 'pie',
        data: pieData,
        options: {},
    })
    self.pieCreated = true
}

/**************** END OF MANAGER ***********************/

/**************** CONSOLIDATIONS ***********************/

DbClass.prototype.getAllConsolidations = function () {
    let self = this
    var mysql = require('mysql')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
    })

    connection.connect()
    let sql = `SELECT 
    c.*,
    cg.*,
    cg.con_group_id as group_id,
    st.service_type_description,
    d.division_description,
    u.user_username,
    c2.city_name as ex_name,
    c3.city_name as to_name
    FROM consolidations c 
    LEFT JOIN consolidation_groups cg on c.con_group_id = cg.con_group_id
    LEFT JOIN divisions d on c.con_division_id = d.division_id 
    LEFT JOIN users u on c.con_user_id = u.user_id 
    LEFT JOIN cities c2 on c2.city_id = cg.con_group_ex 
    LEFT JOIN cities c3 on c3.city_id = cg.con_group_to
    LEFT JOIN service_types st on st.service_type_id = cg.con_group_service_type
    WHERE c.con_status = 'Pending'`
    return new Promise((resolve, reject) => {
        connection.query(sql, function (error, data) {
            connection.end()
            if (error) {
                alert('Unable to get consolidations.')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.updateConsolidationCost = function (consolidationJob) {
    let self = this

    const sql = `UPDATE consolidations set con_estimate_cost = ${consolidationJob.cost} WHERE con_id = ${consolidationJob.id} LIMIT 1;`
    return new Promise((resolve, reject) => {
        self.mysqlConn.query(sql, function (error, data) {
            if (error) {
                alert('Unable to update consolidation cost')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.deleteConsolidation = function (conData) {
    let self = this

    let sql = `DELETE FROM consolidations WHERE con_id = ${conData.con_id}`
    self.mysqlConn.query(sql, function (error, data) {
        if (error) {
            alert('Unable to delete consolidation.')
            console.log(error)
        }
        console.log(data)
    })
    if (conData.con_done_id == null) {
        let updateSql = `UPDATE individuals SET ind_consolidated = 0 WHERE ind_id = ${conData.con_ind_id} LIMIT 1`
        self.mysqlConn.query(updateSql, function (error, data) {
            if (error) {
                alert('Unable to update individual.')
                console.log(err)
            }
            console.log(data)
        })
    } else {
        let updateSql = `UPDATE consolidations_done SET cond_consolidated = 0 WHERE cond_id = ${conData.con_done_id} LIMIT 1`
        self.mysqlConn.query(updateSql, function (error, data) {
            if (error) {
                alert('Unable to update consolidations done.')
                console.log(err)
            }
            console.log(data)
        })
    }

    let delConGroups = `DELETE FROM consolidation_groups WHERE con_group_id NOT IN (SELECT  DISTINCT(con_group_id) from consolidations) AND con_group_active = 1`
    self.mysqlConn.query(delConGroups, function (error, data) {
        if (error) {
            alert('Unable to delete consolidation Groups.')
            console.log(err)
        }
        console.log(data)
    })
}

DbClass.prototype.updateConGroupData = function (groupData) {
    let self = this

    if (groupData.groupCost == '') groupData.groupCost = null
    if (groupData.groupTo == '') groupData.groupTo = null
    if (groupData.groupEx == '') groupData.groupEx = null
    if (groupData.groupServiceType == '') groupData.groupServiceType = null

    const sql = `UPDATE consolidation_groups SET con_group_ex = ${groupData.groupEx}, con_group_to = ${groupData.groupTo}, con_group_cost = ${groupData.groupCost}, con_group_forwarder = '${groupData.groupForwarder}', con_group_rate = ${groupData.groupRate},
        con_group_deadline = '${groupData.groupDeadline}', con_group_mode = '${groupData.groupMode}', con_group_service_type = ${groupData.groupServiceType}, con_group_local_cost = ${groupData.groupLocalCost}, con_group_currency = '${groupData.groupCurrency}' WHERE con_group_id = ${groupData.groupId}`
    return new Promise((resolve, reject) => {
        self.mysqlConn.query(sql, function (error, data) {
            if (error) {
                alert('Unable to update consolidation group')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.confirmConsGroup = async function (data) {
    let self = this

    const cons = await new Promise((resolve, reject) => {
        let sql = `SELECT c.*, cg.* FROM consolidations c JOIN consolidation_groups cg on cg.con_group_id = c.con_group_id   WHERE c.con_group_id = (${data.con_group_id})`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('ERROR on SELECT consolidations')
                reject(err)
            }
            resolve(data)
        })
    })
    if (cons.length == 0) {
        alert('Cannot add get consolidations')
        return false
    }
    let conAdded = await new Promise(function (resolve, reject) {
        let sql = ''
        for (let con of cons) {
            if (con.con_done_id == null) {
                sql = `INSERT INTO consolidations_done (cond_ind_id, cond_con_done_id, cond_user_id, cond_division_id, cond_products, cond_vessels, cond_reference, cond_kg, cond_status, cond_request_date, cond_group_id, cond_pieces, cond_is_grouped, cond_estimate_cost, cond_service_type, cond_type)
                VALUES (${con.con_ind_id}, ${con.con_done_id}, ${self.Helpers.user_id}, ${con.con_division_id}, '${con.con_products}', '${con.con_vessels}', '${con.con_reference}', ${con.con_kg}, 'Done', '${con.con_request_date}', ${con.con_group_id}, ${con.con_pieces}, ${con.con_is_grouped}, ${con.con_estimate_cost}, ${con.con_group_service_type}, '${con.con_type}');`
            } else {
                sql = `INSERT INTO consolidations_done (cond_ind_id, cond_con_done_id, cond_consolidated, cond_user_id, cond_division_id, cond_products, cond_vessels, cond_reference, cond_kg, cond_status, cond_request_date, cond_group_id, cond_pieces, cond_is_grouped, cond_estimate_cost, cond_service_type, cond_type)
                VALUES (${con.con_ind_id}, ${con.con_done_id}, 1, ${self.Helpers.user_id}, ${con.con_division_id}, '${con.con_products}', '${con.con_vessels}', '${con.con_reference}', ${con.con_kg}, 'Done', '${con.con_request_date}', ${con.con_group_id}, ${con.con_pieces}, ${con.con_is_grouped}, ${con.con_estimate_cost}, ${con.con_group_service_type}, '${con.con_type}');`
            }
            self.mysqlConn.query(sql, (err, data) => {
                if (err) {
                    alert('Unable to add consolidations done')
                    console.log(err)
                    reject(false)
                }
            })
        }
        resolve(true)
    })
    if (!conAdded) {
        alert('Cannot add consolidations done')
        return false
    }
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidation_groups set con_group_confirmation_date = now(), con_group_active = 0 WHERE con_group_id =  ${data.con_group_id}`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Erroron on UPDATE consolidation_groups ')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    await new Promise(function (resolve, reject) {
        let sql = `DELETE FROM consolidations WHERE con_group_id =  ${data.con_group_id}`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Error on DELETE consolidations')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
    return true
}

DbClass.prototype.getAllDoneConsolidations = function () {
    let self = this

    const sql = `SELECT 
    c.*,
    cg.con_group_id as group_id,
    cg.*,
    st.service_type_description,
    d.division_description,
    u.user_username,
    c2.city_name as ex_name,
    c3.city_name as to_name
    FROM consolidations_done c 
    LEFT JOIN consolidation_groups cg on c.cond_group_id = cg.con_group_id
    LEFT JOIN divisions d on c.cond_division_id = d.division_id 
    LEFT JOIN users u on c.cond_user_id = u.user_id 
    LEFT JOIN cities c2 on c2.city_id = cg.con_group_ex 
    LEFT JOIN cities c3 on c3.city_id = cg.con_group_to
    LEFT JOIN service_types st on st.service_type_id = cg.con_group_service_type
    `
    return new Promise((resolve, reject) => {
        self.mysqlConn.query(sql, function (error, data) {
            if (error) {
                alert('Error on SELECT consolidations_done')
                reject(error)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.saveConsolidationNotes = async function (conID, notes) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done set cond_notes = "${notes}" WHERE cond_id = ${conID};`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update consolidaiton notes')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

/**************** END OF CONSOLIDATIONS ***********************/

/**************** OVERVIEW ***********************/

DbClass.prototype.getIndividualReport = async function (fromDate, toDate) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT 
        d.division_description, 
        ROUND(sum(ind.ind_estimate_cost), 2) as sum_estimate_cost
        FROM individuals ind
        LEFT JOIN divisions d ON ind.ind_division_id = d.division_id
        WHERE ind_is_grouped = 0
        AND ind_status = 'Done'
        AND ind_mode != 'Personnel'
        AND ind_deleted = 0
        AND ind_confirmation_date BETWEEN '${fromDate}' AND '${toDate}'
        GROUP BY ind_division_id
        ORDER BY d.division_description;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get individual report')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getPersonnelReport = async function (fromDate, toDate) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT 
        d.division_description, 
        ROUND(SUM(ind.ind_estimate_cost), 2) as sum_estimate_cost,
        ROUND(SUM(ind.ind_actual_cost), 2) as sum_actual_cost,
        ROUND(SUM(ind.ind_estimate_cost) - SUM(ind.ind_actual_cost), 2) as savings,
        ROUND((1 - sum(ind.ind_actual_cost) / SUM(ind.ind_estimate_cost)) * 100, 2) as savings_percent
        FROM individuals ind
        LEFT JOIN divisions d on ind.ind_division_id = d.division_id
        WHERE ind_is_grouped = 0
        AND ind_status = 'Done'
        AND ind_mode = 'Personnel'
        AND ind_deleted = 0
        AND ind_confirmation_date BETWEEN '${fromDate}' AND '${toDate}'
        GROUP BY ind_division_id
        ORDER BY d.division_description;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get personnel report')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getIndGroupedReport = async function (fromDate, toDate) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT 
        d.division_description,
        ROUND(sum(i.ind_estimate_cost), 2) as sum_estimate_cost,
        ROUND(sum(i.ind_estimate_cost * ig.ind_group_cost / (SELECT ROUND(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = i.ind_group_id AND ind_deleted = 0)), 2) as shared_cost,
        ROUND(sum(i.ind_estimate_cost) - sum(i.ind_estimate_cost * ig.ind_group_cost / (SELECT ROUND(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = i.ind_group_id AND ind_deleted = 0)), 2) as savings,
        ROUND(((sum(i.ind_estimate_cost) - sum(i.ind_estimate_cost * ig.ind_group_cost / (SELECT ROUND(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = i.ind_group_id AND ind_deleted = 0))) / sum(i.ind_estimate_cost)) * 100, 2) as savings_percent
        FROM individuals i 
        LEFT JOIN divisions d on i.ind_division_id = d.division_id
        LEFT JOIN individual_groups ig on ig.ind_group_id = i.ind_group_id
        WHERE i.ind_status = 'Done'
        AND i.ind_is_grouped = 1
        AND i.ind_deleted = 0
        AND ind_confirmation_date BETWEEN '${fromDate}' AND '${toDate}'
        GROUP BY i.ind_division_id
        ORDER BY d.division_description;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get Grouped report')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getConGroupedReport = async function (fromDate, toDate) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT 
        d.division_description,
        ROUND(sum(cd.cond_estimate_cost), 2) as sum_estimate_cost,
        ROUND(sum(cd.cond_kg * cg.con_group_cost / (SELECT sum(cond_kg) FROM consolidations_done WHERE cond_group_id = cd.cond_group_id and cond_is_grouped = 1)), 2) as shared_cost,
        ROUND(sum(cd.cond_estimate_cost) - sum(cd.cond_kg * cg.con_group_cost / (SELECT sum(cond_kg) FROM consolidations_done WHERE cond_group_id = cd.cond_group_id and cond_is_grouped = 1)), 2) as savings,
        ROUND(((sum(cd.cond_estimate_cost) - sum(cd.cond_kg * cg.con_group_cost / (SELECT sum(cond_kg) FROM consolidations_done WHERE cond_group_id = cd.cond_group_id and cond_is_grouped = 1))) / sum(cd.cond_estimate_cost)) * 100, 2) AS savings_percent
        FROM consolidations_done cd
        LEFT JOIN divisions d on cd.cond_division_id = d.division_id
        LEFT JOIN consolidation_groups cg on cd.cond_group_id = cg.con_group_id
        WHERE cd.cond_is_grouped = 1
        AND cg.con_group_confirmation_date BETWEEN '${fromDate}' AND '${toDate}'
        GROUP BY cd.cond_division_id
        ORDER BY d.division_description;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to get Consolidation report')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}
/**************** END OF OVERVIEW ***********************/

DbClass.prototype.getIndividualsByReference = async function (reference) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT ind.*,
        c.city_name as ex_city,
        c2.city_name as to_city,
        st.service_type_description as service_name
        FROM individuals ind
        left join cities c ON c.city_id = ind.ind_ex
        left join cities c2 ON c2.city_id = ind.ind_to
        left join service_types st on st.service_type_id = ind.ind_service_type 
        where ind_reference like '%${reference}%';`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to find ind by reference')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getConsolidationsByReference = async function (reference) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT con.*,
        c.city_name as ex_city,
        c2.city_name as to_city,
        cg.con_group_deadline as group_deadline,
        st.service_type_description as service_name
        FROM consolidations con
        left join consolidation_groups cg ON cg.con_group_id  = con.con_group_id 
        left join cities c ON c.city_id = cg.con_group_ex 
        left join cities c2 ON c2.city_id = cg.con_group_to
        left join service_types st on st.service_type_id = cg.con_group_service_type
        where con_reference like '%${reference}%';`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to find con by reference')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.getConsolidationDoneByReference = async function (reference) {
    let self = this

    return new Promise(function (resolve, reject) {
        let sql = `SELECT con.*,
        cg.con_group_deadline as group_deadline, 
        c.city_name as ex_city,
        c2.city_name as to_city,
        st.service_type_description as service_name
        FROM consolidations_done con
        left join consolidation_groups cg ON cg.con_group_id  = con.cond_group_id 
        left join cities c ON c.city_id = cg.con_group_ex 
        left join cities c2 ON c2.city_id = cg.con_group_to
        left join service_types st on st.service_type_id = cg.con_group_service_type
        where cond_reference like '%${reference}%';`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to find cond by reference')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.updateGroupOnBoardDelivery = async function (groupId) {
    let self = this
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done SET cond_delivered_on_board = 1 WHERE cond_group_id = ${groupId};`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to find cond by reference')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.updateGroupHighlight = async function (jobId, status) {
    let self = this
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done SET cond_highlight = ${status} WHERE cond_id = ${jobId};`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update group highlight')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.revertOnBoardDelivery = async function (jobId) {
    let self = this
    return new Promise(function (resolve, reject) {
        let sql = `UPDATE consolidations_done SET cond_consolidated = 0, cond_delivered_on_board = 0 WHERE cond_id = ${jobId};`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('Unable to update revert delivery on board')
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}

DbClass.prototype.splitJob = async function (jd) {
    let self = this

    const insertedIndividuals = await new Promise(function (resolve, reject) {
        let vessels = jd.ind_vessels.split(';')
        for (let vess of vessels) {
            let sql =
                `INSERT INTO individuals (ind_user_id, ind_division_id, ind_vessels, ind_ex, ind_to, ind_request_date, ind_is_grouped, ind_consolidated, ind_deadline, ind_status, ind_forwarder, ind_mode, ind_confirmation_date, ind_group_id, ind_deleted, ind_service_type, ind_splitted, ind_parent)` +
                ` VALUES (${jd.ind_user_id}, ${jd.ind_division_id}, '${vess}',  ${jd.ind_ex}, ${jd.ind_to}, '${jd.original_request_date}', ${jd.ind_is_grouped}, 0, '${jd.original_deadline}', 'Done', '${jd.ind_forwarder}', '${jd.ind_mode}', '${jd.original_confirmation_date}', ${jd.ind_group_id}, 0, ${jd.ind_service_type}, 0, ${jd.ind_id});`
            self.mysqlConn.query(sql, (err, data) => {
                if (err) {
                    alert('ERROR on INSERT individuals')
                    console.log(err)
                    reject(false)
                }
            })
        }
        resolve(true)
    })
    if (!insertedIndividuals) return
    await new Promise(function (resolve, reject) {
        let sql = `UPDATE individuals SET ind_splitted = 1 WHERE ind_id = ${jd.ind_id} LIMIT 1;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('ERROR on UPDATED individuals')
                console.log(err)
                reject(false)
            }
            resolve(true)
        })
    })
}

DbClass.prototype.updateIndDoneJob = async function (jd) {
    let self = this
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE individuals SET ind_products = '${jd.products}', ind_pieces = ${jd.pieces}, ind_kg = ${jd.kg}, ind_notes = '${jd.notes}', ind_reference = '${jd.reference}' WHERE ind_id = ${jd.id} LIMIT 1;`
        self.mysqlConn.query(sql, (err, data) => {
            if (err) {
                alert('ERROR on UPDATED individuals')
                console.log(err)
                reject(false)
            }
            resolve(true)
        })
    })
}
