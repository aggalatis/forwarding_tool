let DbClass = function () {

    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();
    this.serverIP = '';
    this.user = '';
    this.port = '';
    this.database = '';
    this.products = [];
    this.divisions = [];
    this.vessels = [];
    this.colors = [];
    this.pieCreated = false;
    this.getServerDataFromRegistry();


}

DbClass.prototype.getServerDataFromRegistry = function () {

    let self = this;

    let fs = require('fs')

    var dbFile = fs.readFileSync("C:\\ForwardTool\\dbdata.agcfg", 'utf8')

    var dbFileData = dbFile.split(';')
    self.database = dbFileData[0];
    self.port = dbFileData[1];
    self.serverIP = dbFileData[2];
    self.user = dbFileData[3];
    self.dbpass = dbFileData[4];


}

DbClass.prototype.verifyLogin = function (username, password) {

    let self = this;

    var mysql = require('mysql');
    var md5 = require('md5')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port
    });

    connection.connect();

    password = md5(password);
    connection.query('SELECT * FROM users WHERE user_username = "' + username + '" AND user_password = "' + password + '" LIMIT 1', function (error, user) {
        if (error) throw error;

        if (user.length === 0) {

            $('#user_username').val('').blur()
            $('#user_password').val('').blur()

            self.Helpers.toastr('error', 'Wrong username or password. Please try again.')

        } else {

            self.Helpers.saveUserData(user[0]);
            $('#sign-in-btn').prop('disabled', 'disabled');
            $('#sign-in-btn').html('attempting connection...');


            ipcRenderer.send('loadTransfers', user[0])


        }

    });

    connection.end();


}

DbClass.prototype.getAllIndividuals = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
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
        ' individual_groups.ind_group_active' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = ind_jobs.ind_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = ind_jobs.ind_to' +
        ' WHERE ind_jobs.ind_status = "Pending" AND ind_deleted = 0' +
        ' ORDER BY ind_jobs.ind_group_id DESC;'

    console.log(sql)
    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];

            for (j = 0; j < values.length; j++) {
                dataset[i].push(values[j])

            }

        }
        var jobs_table = $('#jobs_table').DataTable({
            "data": dataset,
            "processing": true,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCTS", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "VESSELS", "orderable": false},
                {"title": "EX", "orderable": false, className: "danger-header"},
                {"title": "TO", "orderable": false, className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,  className: "danger-header"},
                {"title": "FORWARDER", "orderable": false},
                {"title": "REFERENCE", "orderable": false},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST (€)", "orderable": false},
                {"title": "NOTES", "visible": false},
                {
                    "title": "Group",
                    "visible": false
                },
                {
                    "title": "Is grouped",
                    "visible": false
                },
                {
                    "title": "Group Color",
                    "visible": false
                },
                {
                    "title": "Group Cost",
                    "visible": false
                },
                {
                    "title": "GROUP DEADLINE",
                    "orderable": false,
                    "visible": false
                },

                {
                    "title": "GROUP FORWARDER",
                    "orderable": false
                },
                {
                    "title": "Sum estimate cost",
                    "visible": false
                },
                {
                    "title": "Group Active",
                    "visible": false
                },
                {
                    "title": "ACTIONS",
                    "orderable": false,
                    "createdCell": function(td, cellData, rowData, row, col) {
                        if (rowData[22] == 0) {
                            $(td).children('.job-edit').hide();
                            $(td).children('.delete-job').hide();
                        }
                    },
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' id='delete-me' style='cursor: pointer'></i><i class='fa fa-check confirm-job action-btn' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "rowCallback": function (row, data, index, cells) {
                //Here I am changing background Color
                if (data[17] != "empty") {

                    $('td', row).css('background-color', data[17]);
                }


            },
            "order": [ [7, 'asc'], [8, 'asc'], [16, 'desc'], [19, 'desc']],
            "pageLength": 25

        });



        $('#jobs_table').on('click', 'i.job-edit', function () {

            var data = jobs_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to edit this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }

            self.Helpers.initliazeModalToEditJob(self.divisions, self.products, self.vessels, self.cities, data);

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
                var ind_ex = $('#ex-input').val();
                var ind_to = $('#to-input').val();
                var reference = $('#reference').val();
                var kg = self.Helpers.formatFloatValue($('#kg').val());
                var deadline = $('#deadline_date').val()

                console.log(data)
                if (deadline != '' & modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '') {

                    $(this).attr('disabled', 'disabled')

                    //change productIds to product Names
                    var productsNames = [];
                    for (i = 0; i < self.products.length; i++) {
                        if (productSelectValue.indexOf(self.products[i].product_id.toString()) !== -1) {
                            //this means i found the product
                            productsNames.push(self.products[i].product_description)
                        }
                    }

                    var vesselsNames = [];
                    for (i = 0; i < self.vessels.length; i++) {
                        if (vesselSelectValue.indexOf(self.vessels[i].vessel_id.toString()) !== -1) {
                            //this means i found the vessel
                            vesselsNames.push(self.vessels[i].vessel_description)
                        }
                    }

                    if (ind_ex != '' && ind_to != '') {
                        var jobObject = {
                            ind_id: data[0],
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
                            ind_estimate_cost: estimatecostSelectValue,
                            ind_reference: reference,
                            ind_kg: kg,
                            ind_group_id: 0,
                            old_group_id: data[15]


                        }

                        self.updateJob(jobObject);

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

            var data = jobs_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to confirm this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            //checking if the individual is grouped...
            if (data[16] == 0) {

                Swal.fire({
                    title: "Are you sure?",
                    text: "If you confirm the job you will be unable to edit it!",
                    icon: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#dc3545",
                    confirmButtonText: "Confirm",

                }).then((result) => {
                    if (result.isConfirmed) {
                    self.confirmIndividualGroup(data[15]);

                    }

                })




            } else {


                if (data[18] == "" || data[18] == 0 || data[19] == "" || data[19] === null || data[20] == '' || data[20] === null) {

                    Swal.fire({
                        title: "Unable to confirm this group.",
                        text: "Some group data are empty. Please fill the missing data and try again. ",
                        icon: "error",
                        showCancelButton: true,
                        showConfirmButton: false
                    })


                } else {

                    Swal.fire({
                        title: "Are you sure?",
                        text: "If you confirm this group you will not be able to edit it!",
                        icon: "warning",
                        showCancelButton: true,
                        cancelButtonText: "Cancel",
                        confirmButtonColor: "#dc3545",
                        confirmButtonText: "Confirm",

                    }).then((result) => {
                        if (result.isConfirmed) {
                        self.confirmIndividualGroup(data[15]);

                    }

                })
                }


            }

        })

        $('#jobs_table').on('click', 'i.costs-job', function () {

            var data = jobs_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to manage costs in this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }


            $('#cost-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            $('#job_estimate_costs').val(data[13])
            $('#department').val(data[3])

            if (data[16] == 0) {

                $('#group-cost-div').hide();
                $('#save-costs').hide()

            } else {

                if (data[18] == null || data[19] == null || data[20] == null)
                {
                    var allData = jobs_table.rows().data()
                    for (var i=0; i < allData.length; i++) {

                        if (allData[i][15] == data[15]) {
                            if (allData[i][13] == 0) {
                                Swal.fire({
                                    title: "Unable to manage group costs.",
                                    text: "There is a job with empty estimate cost inside this group. Please fill it up.",
                                    icon: "error",
                                    showCancelButton: true,
                                    showConfirmButton: false
                                })
                                return;

                            }
                        }
                    }

                    $('#saving-data').hide();
                } else {
                    $('#saving-data').show();

                }

                self.initializeGroupCitySelect(data[7], data[8]);
                $('#group_cut_off_date').val(data[19])
                var sum_estimate_cost = data[21]
                var group_cost = data[18]

                var savings_percent = ((1 - (group_cost / sum_estimate_cost)) * 100).toFixed(2)
                var savings_amount = (data[13] * savings_percent / 100).toFixed(2)
                var shared_cost = ((group_cost / sum_estimate_cost) * data[13]).toFixed(2)

                if (data[18] == null) {
                    $('#group_cost').val("")
                } else {
                    $('#group_cost').val(self.Helpers.formatFloatValue(String(group_cost)))
                }

                $('#group_id').val(data[15])
                $('#saving_amount').val(savings_amount)
                $('#saving_percent').val(savings_percent)
                $('#shared_cost').val(shared_cost)
                $('#group_forwarder').val(data[20])
                $('#group-cost-div').show();
                $('#save-costs').show()
            }

            $('#costs-modal').modal('show');
        })

        $('#jobs_table').on('click', 'i.delete-job', function () {

            var data = jobs_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to delete this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            Swal.fire({
                title: "Delete Job?",
                text: "Are you sure you want to delete this job? You won't be able to revert it!",
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Confirm",

            }).then((result) => {
                if (result.isConfirmed) {
                    self.deleteIndividual(data);

                }

        })
        })


        $("#search_datatable").keyup(function () {
            jobs_table.search($(this).val()).draw();
        });

    });


    connection.end();

}

DbClass.prototype.getAllPersonnel = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' per_jobs.per_id,' +
        ' DATE_FORMAT(per_jobs.per_request_date, "%d/%m/%Y %H:%i:%s" ) as per_request_date,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' per_jobs.per_products,' +
        ' per_jobs.per_mode,' +
        ' per_jobs.per_name,' +
        ' per_jobs.per_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' DATE_FORMAT(per_jobs.per_deadline, "%d/%m/%Y") as per_deadline,' +

        ' per_jobs.per_kg,' +
        ' Round(per_jobs.per_estimate_cost,2) as per_estiamte_cost,' +
        ' Round(per_jobs.per_actual_cost,2) as per_actual_cost,' +
        ' Round(per_jobs.per_saving,2) as per_saving,' +
        ' per_jobs.per_notes' +
        ' FROM personnel as per_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = per_jobs.per_division_id' +
        ' LEFT JOIN users on users.user_id = per_jobs.per_user_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = per_jobs.per_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = per_jobs.per_to' +
        ' WHERE per_jobs.per_status = "Pending" AND per_deleted = 0' +
        ' ORDER BY per_jobs.per_id DESC;'


    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];

            for (j = 0; j < values.length; j++) {
                dataset[i].push(values[j])

            }

        }
        var personnel_table = $('#personnel_table').DataTable({
            "data": dataset,
            "processing": true,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCTS", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "NAME", "orderable": false},
                {"title": "VESSELS", "orderable": false},
                {"title": "EX", "orderable": false, className: "danger-header"},
                {"title": "TO", "orderable": false, className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,  className: "danger-header"},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST (€)", "orderable": false},
                {"title": "ACTUAL COST (€)", "orderable": false},
                {"title": "SAVINGS (€)", "orderable": false},
                {"title": "NOTES", "visible": false},
                {
                    "title": "ACTIONS",
                    "orderable": false,
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-check confirm-job action-btn' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "order": [[0, 'desc']],
            "pageLength": 25

        });


        $('#personnel_table').on('click', 'i.job-edit', function () {

            var data = personnel_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to edit this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            self.Helpers.initliazeModalToEditPersonnel(self.divisions, self.products, self.vessels, self.cities, data);

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            $('#save-per-btn').unbind('click')
            $('#save-per-btn').on('click', function () {


                $(this).attr('disabled', 'disabled')
                var modeSelectValue = $('#mode-select').val()
                var divisionSelectValue = $('#division-select').val()
                var productSelectValue = $('#product-select').val()
                var vesselSelectValue = $('#vessel-select').val()
                var per_ex = $('#ex-input').val();
                var per_to = $('#to-input').val();
                var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
                var actualCostValue = self.Helpers.formatFloatValue($('#actual_cost').val())
                var name = $('#name').val()
                var savings = self.Helpers.formatFloatValue($('#saving').val())
                var kg = $('#kg').val();
                var deadline = $('#deadline_date').val()

                if (deadline != '' & modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && estimatecostSelectValue != '' && actualCostValue != '' && name != '' && name != '') {

                    $(this).attr('disabled', 'disabled')

                    //change productIds to product Names
                    var productsNames = [];
                    for (i = 0; i < self.products.length; i++) {
                        if (productSelectValue.indexOf(self.products[i].product_id.toString()) !== -1) {
                            //this means i found the product
                            productsNames.push(self.products[i].product_description)
                        }
                    }

                    var vesselsNames = [];
                    for (i = 0; i < self.vessels.length; i++) {
                        if (vesselSelectValue.indexOf(self.vessels[i].vessel_id.toString()) !== -1) {
                            //this means i found the vessel
                            vesselsNames.push(self.vessels[i].vessel_description)
                        }
                    }
                    if (per_ex != '' && per_to != '') {

                        var personnelData = {
                            per_id: data[0],
                            per_user_id: self.Helpers.user_id,
                            per_division_id: divisionSelectValue,
                            per_products: productsNames.join(';'),
                            per_vessels: vesselsNames.join(';'),
                            per_mode: modeSelectValue,
                            per_ex: per_ex,
                            per_to: per_to,
                            per_name: name,
                            per_kg: kg,
                            per_deadline: self.Helpers.changeDateToMysql(deadline),
                            per_estimate_cost: estimatecostSelectValue,
                            per_actual_cost: actualCostValue,
                            per_savings: savings,
                            per_notes: $('#notes').val()


                        }
                        self.updatePersonnel(personnelData);
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

        $('#personnel_table').on('click', 'i.confirm-job', function () {

            var data = personnel_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to confirm this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            //checking if the individual is grouped...

                Swal.fire({
                    title: "Are you sure?",
                    text: "If you confirm the job you will be unable to edit it!",
                    icon: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#dc3545",
                    confirmButtonText: "Confirm",

                }).then((result) => {
                    if (result.isConfirmed) {
                    self.confirmPersonnel(data[0]);

                }

            })


        })


        $('#personnel_table').on('click', 'i.delete-job', function () {

            var data = personnel_table.row($(this).closest('tr')).data();
            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to delete this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            Swal.fire({
                title: "Delete Job?",
                text: "Are you sure you want to delete this job? You won't be able to revert it!",
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Cancel",
                confirmButtonColor: "#dc3545",
                confirmButtonText: "Confirm",

            }).then((result) => {
                if (result.isConfirmed) {
                self.deletePersonnel(data);

            }

        })
        })


        $("#search_datatable").keyup(function () {
            personnel_table.search($(this).val()).draw();
        });

    });


    connection.end();

}

DbClass.prototype.getAllDeletedIndividuals = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' users.user_username,' +
        ' ind_jobs.ind_group_id,' +
        ' divisions.division_description,' +
        ' ind_jobs.ind_products,' +
        ' ind_jobs.ind_mode,' +
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
        ' WHERE ind_deleted = 1' +
        ' ORDER BY ind_jobs.ind_group_id DESC;'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];

            for (j = 0; j < values.length; j++) {
                dataset[i].push(values[j])


            }

        }


        var jobs_table = $('#deleted_individuals_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "GROUP", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false,className: "danger-header"},
                {"title": "TO", "orderable": false,className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,className: "danger-header"},
                {"title": "CONFIRMATION DATE", "orderable": false},
                {"title": "FORWARDER", "orderable": false},
                {"title": "REFERENCE", "orderable": false},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST", "orderable": false},
                {"title": "NOTES", "visible": false},
                {"title": "Group Color", "visible": false},
                {"title": "Group Cost", "visible": false},
                {"title": "GROUP DEADLINE", "orderable": false},
                {"title": "GROUP FORWARDER", "orderable": false},
                {"title": "Sum estimate cost", "visible": false},
                {"title": "DEL.DATE", "visible": true},
                // {
                //     "title": "ACTIONS", "orderable": false,
                //     "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-dollar done-job-cost action-btn' style='cursor: pointer' ></i>"
                // }

            ],
            "order": [[3, 'desc']],
            "pageLength": 25
        });



        $("#search_datatable").keyup(function () {
            jobs_table.search($(this).val()).draw();
        });


    });

    connection.end();

}

DbClass.prototype.getAllDeletedPersonnel = function() {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' per_jobs.per_id,' +
        ' DATE_FORMAT(per_jobs.per_request_date, "%d/%m/%Y %H:%i:%s" ) as per_request_date,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' per_jobs.per_products,' +
        ' per_jobs.per_mode,' +
        ' per_jobs.per_name,' +
        ' per_jobs.per_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' DATE_FORMAT(per_jobs.per_deadline, "%d/%m/%Y") as per_deadline,' +
        ' per_jobs.per_kg,' +
        ' Round(per_jobs.per_estimate_cost,2) as per_estiamte_cost,' +
        ' Round(per_jobs.per_actual_cost,2) as per_actual_cost,' +
        ' Round(per_jobs.per_saving,2) as per_saving,' +
        ' DATE_FORMAT(per_jobs.per_date_deleted, "%d/%m/%Y %H:%i:%s" ) as per_date_deleted,' +
        ' per_jobs.per_notes' +
        ' FROM personnel as per_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = per_jobs.per_division_id' +
        ' LEFT JOIN users on users.user_id = per_jobs.per_user_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = per_jobs.per_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = per_jobs.per_to' +
        ' WHERE per_deleted = 1' +
        ' ORDER BY per_jobs.per_id DESC;'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                dataset[i].push(values[j])



            }

        }

        var deleted_personnel_table = $('#deleted_personnel_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "NAME", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false,className: "danger-header"},
                {"title": "TO", "orderable": false,className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,className: "danger-header"},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST", "orderable": false},
                {"title": "ACTUAL COST", "orderable": false},
                {"title": "SAVINGS", "orderable": false},
                {"title": "DELETED DATE", "orderable": false},
                {"title": "NOTES", "visible": false},

            ],
            "order": [[1, 'desc']],
            "pageLength": 25
        });




        $("#search_datatable").keyup(function () {
            deleted_personnel_table.search($(this).val()).draw();
        });


    });

    connection.end();
}

DbClass.prototype.getAllDoneIndividuals = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' users.user_username,' +
        ' ind_jobs.ind_group_id,' +
        ' ind_jobs.ind_is_grouped,' +
        ' divisions.division_description,' +
        ' ind_jobs.ind_products,' +
        ' ind_jobs.ind_mode,' +
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
        ' (SELECT Round(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id AND ind_deleted = 0) as sum_estimated_cost' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = ind_jobs.ind_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = ind_jobs.ind_to' +
        ' WHERE ind_jobs.ind_status = "Done" AND ind_deleted = 0' +
        ' ORDER BY ind_jobs.ind_group_id DESC;'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];

            for (j = 0; j < values.length; j++) {
                if (j == 4) {

                    if (values[j] == 0) {

                        dataset[i].push('Individual')
                    } else {

                        dataset[i].push('Grouped')
                    }
                } else {
                    dataset[i].push(values[j])
                }


            }

        }


        var jobs_table = $('#done_individuals_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "GROUP ID", "orderable": false},
                {"title": "TYPE", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false,className: "danger-header"},
                {"title": "TO", "orderable": false,className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,className: "danger-header"},
                {"title": "CONFIRMATION DATE", "orderable": false},
                {"title": "FORWARDER", "orderable": false},
                {"title": "REFERENCE", "orderable": false},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST", "orderable": false},
                {"title": "NOTES", "visible": false},
                {"title": "Group Color", "visible": false},
                {"title": "Group Cost", "visible": false},
                {"title": "GROUP DEADLINE", "orderable": false},
                {"title": "GROUP FORWARDER", "orderable": false},
                {"title": "Sum estimate cost", "visible": false},
                {
                    "title": "ACTIONS", "orderable": false,
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-dollar done-job-cost action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "order": [[4, 'asc']],
            "pageLength": 25
        });


        $('#done_individuals_table').on('click', 'i.job-edit', function () {

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = jobs_table.row($(this).parents('tr')).data();

            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to edit this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return
            }
            $('#done_ind_id').val(data[0])
            $('#notes').val(data[17])
            $('#notes-modal').modal('show')


        })

        $('#done_individuals_table').on('click', 'i.done-job-cost', function () {

            $('#cost-data-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = jobs_table.row($(this).closest('tr')).data();

            $('#job_estimate_costs').val(data[16])
            $('#department').val(data[5])

            if (data[4] == 'Individual') {

                $('#group-cost-div').hide();

            } else {

                var sum_estimate_cost = data[22]
                var group_cost = data[19]

                var savings_percent = ((1 - (group_cost / sum_estimate_cost)) * 100).toFixed(2)

                var savings_amount = (data[16] * savings_percent / 100).toFixed(2)
                var shared_cost = ((group_cost / sum_estimate_cost) * data[16]).toFixed(2)

                $('#group_cost').val(self.Helpers.formatFloatValue(String(group_cost)))
                $('#group_id').val(data[3])
                $('#saving_amount').val(savings_amount)
                $('#saving_percent').val(savings_percent)
                $('#shared_cost').val(shared_cost)
                $('#group_forwarder').val(data[21])
                $('#group-cost-div').show();
                $('#save-costs').show()
            }

            $('#done-costs-modal').modal('show');
        })

        $("#search_datatable").keyup(function () {
            jobs_table.search($(this).val()).draw();
        });


    });

    connection.end();

}

DbClass.prototype.getAllDonePersonnel = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' per_jobs.per_id,' +
        ' DATE_FORMAT(per_jobs.per_request_date, "%d/%m/%Y %H:%i:%s" ) as per_request_date,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' per_jobs.per_products,' +
        ' per_jobs.per_mode,' +
        ' per_jobs.per_name,' +
        ' per_jobs.per_vessels,' +
        ' ex_city.city_name as ex_city,' +
        ' to_city.city_name as to_city,' +
        ' DATE_FORMAT(per_jobs.per_deadline, "%d/%m/%Y") as per_deadline,' +
        ' DATE_FORMAT(per_jobs.per_confirmation_date, "%d/%m/%Y %H:%i:%s" ) as per_confirmation_date,' +
        ' per_jobs.per_kg,' +
        ' Round(per_jobs.per_estimate_cost,2) as per_estiamte_cost,' +
        ' Round(per_jobs.per_actual_cost,2) as per_actual_cost,' +
        ' Round(per_jobs.per_saving,2) as per_saving,' +
        ' per_jobs.per_notes' +
        ' FROM personnel as per_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = per_jobs.per_division_id' +
        ' LEFT JOIN users on users.user_id = per_jobs.per_user_id' +
        ' LEFT JOIN cities as ex_city on ex_city.city_id = per_jobs.per_ex' +
        ' LEFT JOIN cities as to_city on to_city.city_id = per_jobs.per_to' +
        ' WHERE per_jobs.per_status = "Done" AND per_deleted = 0' +
        ' ORDER BY per_jobs.per_id DESC;'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                    dataset[i].push(values[j])



            }

        }

        var done_personnel_table = $('#done_personnel_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "NAME", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false,className: "danger-header"},
                {"title": "TO", "orderable": false,className: "danger-header"},
                {"title": "DEADLINE", "orderable": false,className: "danger-header"},
                {"title": "CONFIRMATION DATE", "orderable": false},
                {"title": "KG", "orderable": false},
                {"title": "ESTIMATE COST", "orderable": false},
                {"title": "ACTUAL COST", "orderable": false},
                {"title": "SAVINGS", "orderable": false},
                {"title": "NOTES", "visible": false},
                {
                    "title": "ACTIONS", "orderable": false,
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i>"
                }

            ],
            "order": [[1, 'desc']],
            "pageLength": 25
        });


        $('#done_personnel_table').on('click', 'i.job-edit', function () {

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = done_personnel_table.row($(this).parents('tr')).data();

            if (!self.Helpers.checkIfUserHasPriviledges(data[2])) {
                Swal.fire({
                    title: "Unable to edit this job.",
                    text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                    icon: "error",
                    showCancelButton: true,
                    showConfirmButton: false
                })
                return;
            }

            $('#done_per_id').val(data[0])
            $('#notes').val(data[16])
            $('#notes-modal').modal('show')


        })


        $("#search_datatable").keyup(function () {
            done_personnel_table.search($(this).val()).draw();
        });


    });

    connection.end();

}

DbClass.prototype.getAllDoneConsolidations = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' con.con_id,' +
        ' users.user_username,' +
        ' con.con_group_id,' +
        ' divisions.division_description,' +
        ' products.product_description,' +
        ' con.con_mode,' +
        ' con.con_carrier,' +
        ' con.con_reference,' +
        ' con.con_actual_weight,' +
        ' con.con_length,' +
        ' con.con_width,' +
        ' con.con_height,' +
        ' con.con_pieces,' +
        ' con.con_volume_weight,' +
        ' con.con_chargable_weight,' +
        ' vessels.vessel_description,' +
        ' con.con_ex as ex_port, ' +
        ' con.con_to as to_port,' +
        ' DATE_FORMAT(con.con_request_date, "%d/%m/%Y %H:%i:%s") as con_request_date,' +
        ' DATE_FORMAT(con.con_deadline, "%d/%m/%Y") as con_deadline,' +
        ' DATE_FORMAT(con.con_cut_off_date, "%d/%m/%Y") as con_cut_off_date,' +
        ' DATE_FORMAT(con.con_confirmation_date, "%d/%m/%Y") as con_confirmation_date,' +
        ' con.con_status,' +
        ' consolidation_groups.con_group_forwarder,' +
        ' con.con_notes,' +
        ' consolidation_groups.con_group_color,' +
        ' consolidation_groups.con_group_cost,' +
        ' (SELECT sum(consolidations.con_chargable_weight) FROM consolidations WHERE con_group_id = con.con_group_id) as sum_chargable_weight' +
        ' FROM consolidations con' +
        ' LEFT JOIN divisions on division_id = con.con_division_id' +
        ' LEFT JOIN users on user_id = con.con_user_id' +
        ' LEFT JOIN products on product_id = con.con_product_id' +
        ' LEFT JOIN vessels on vessel_id = con.con_vessel_id' +
        ' LEFT JOIN consolidation_groups on consolidation_groups.con_group_id = con.con_group_id' +
        ' WHERE con.con_status = "Done";'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        var rate_per_kg = 0;
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                if (j == 22) {

                    dataset[i].push("<p style='color: #056608'>" + values[j] + "</p>")
                } else if (j == 15) {

                    rate_per_kg = (values[26] / values[27]).toFixed(2)
                    dataset[i].push(rate_per_kg)
                    dataset[i].push(values[j])

                } else {
                    if (values[j] == "null") {

                        dataset[i].push('')
                    } else {

                        dataset[i].push(values[j])
                    }

                }


            }

        }


        var done_consolidations_table = $('#done_consolidations_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "USER", "orderable": false},
                {
                    "title": "GROUP", "orderable": false,
                    "visible": true
                },
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "CARRIER", "orderable": false},
                {"title": "REFERENCE", "orderable": false},
                {"title": "ACT. WEIGHT", "orderable": false},
                {"title": "L", "orderable": false},
                {"title": "W", "orderable": false},
                {"title": "H", "orderable": false},
                {"title": "Pcs", "orderable": false},
                {"title": "VOL. W.", "orderable": false},
                {"title": "CHG. W.", "orderable": false},
                {
                    "title": "RATE PER KG",
                    "orderable": false
                },
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false, className: "danger-header"},
                {"title": "TO", "orderable": false, className: "danger-header"},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "DEADLINE", "orderable": false},
                {"title": "CUT-OFF DATE", "orderable": false},
                {"title": "CONFIRMATION DATE", "orderable": false},
                {"title": "STATUS", "orderable": false},
                {"title": "FORWARDER", "orderable": false},

                {"title": "NOTES", "orderable": false},

                {
                    "title": "Group Color",
                    "visible": false
                },
                {
                    "title": "Group Cost",
                    "visible": false
                },
                {
                    "title": "Sum Chargable Weight",
                    "visible": false
                },

                {
                    "title": "ACTIONS", "orderable": false,
                    "defaultContent": "<i class='fa fa-search done-con-edit action-btn' style='cursor: pointer'></i><i class='fa fa-dollar done-costs-job action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "order": [[2, 'desc']],
            "pageLength": 25
        });

        $('#done_consolidations_table').on('click', 'i.done-con-edit', function () {

            $('#edit-notes-consolidation-head').removeClass('noFloat floatMeLeft floatMeRight')
            var data = done_consolidations_table.row($(this).parents('tr')).data();

            $('#done_consolidation_id').val(data[0])
            $('#notes').val(data[25])
            $('#consol-notes-modal').modal('show')


        })

        $('#done_consolidations_table').on('click', 'i.done-costs-job', function () {

            $('#cost-done-cons-head').removeClass('noFloat floatMeLeft floatMeRight')
            var data = done_consolidations_table.row($(this).closest('tr')).data();

            $('#consolidation_group_cost').val(self.Helpers.formatFloatValue(String(data[27])))
            $('#consolidation_id').val(data[2])

            var sum_chargable_weight = data[28]
            var chargable_weight = data[14]
            var ratePerKG = data[27] / sum_chargable_weight

            var shared_cost = (chargable_weight / sum_chargable_weight) * data[27]
            $('#rate_per_kg').val(ratePerKG.toFixed(2))
            $('#shared_consolidation_cost').val(shared_cost.toFixed(2))
            $('#done-consolidation-cost-modal').modal('show');
        })

        $("#search_datatable").keyup(function () {
            done_consolidations_table.search($(this).val()).draw();
        });
    })


    connection.end();

}

DbClass.prototype.getAllConsolidations = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' con.con_id,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' products.product_description,' +
        ' con.con_mode,' +
        ' con.con_carrier,' +
        ' con.con_reference,' +
        ' con.con_actual_weight,' +
        ' con.con_length,' +
        ' con.con_width,' +
        ' con.con_height,' +
        ' con.con_pieces,' +
        ' con.con_volume_weight,' +
        ' con.con_chargable_weight,' +
        ' vessels.vessel_description,' +
        ' con.con_ex as ex_port, ' +
        ' con.con_to as to_port,' +
        ' DATE_FORMAT(con.con_request_date, "%d/%m/%Y %H:%i:%s") as con_request_date,' +
        ' DATE_FORMAT(con.con_deadline, "%d/%m/%Y") as con_deadline,' +
        ' DATE_FORMAT(con.con_cut_off_date, "%d/%m/%Y") as con_cut_off_date,' +
        ' con.con_status,' +
        ' consolidation_groups.con_group_forwarder,' +
        ' con.con_notes,' +
        ' con.con_group_id,' +
        ' consolidation_groups.con_group_color,' +
        ' consolidation_groups.con_group_cost,' +
        ' (SELECT sum(consolidations.con_chargable_weight) FROM consolidations WHERE con_group_id = con.con_group_id) as sum_chargable_weight' +
        ' FROM consolidations con' +
        ' LEFT JOIN divisions on division_id = con.con_division_id' +
        ' LEFT JOIN users on user_id = con.con_user_id' +
        ' LEFT JOIN products on product_id = con.con_product_id' +
        ' LEFT JOIN vessels on vessel_id = con.con_vessel_id' +
        ' LEFT JOIN consolidation_groups on consolidation_groups.con_group_id = con.con_group_id' +
        ' WHERE con.con_status = "Pending";'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                if (j == 20) {

                    dataset[i].push("<p style='color: #FFA500'>" + values[j] + "</p>")
                } else if (j == 14) {

                    rate_per_kg = (values[25] / values[26]).toFixed(2)
                    dataset[i].push(rate_per_kg)
                    dataset[i].push(values[j])


                } else {

                    if (values[j] == "null") {

                        dataset[i].push('')
                    } else {

                        dataset[i].push(values[j])
                    }

                }


            }

        }


        var consolidation_table = $('#consolidations_table').DataTable({
            "data": dataset,
            "fixedHeader": {
                headerOffset: 100,
                header: true,
                footer: false
            },
            "bLengthChange": false,
            "columns": [
                {"title": "ID", "orderable": false},
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "CARRIER", "orderable": false},
                {"title": "REFERENCE", "orderable": false},
                {"title": "ACT. WEIGHT", "orderable": false},
                {"title": "L", "orderable": false},
                {"title": "W", "orderable": false},
                {"title": "H", "orderable": false},
                {"title": "Pcs", "orderable": false},
                {"title": "VOL. W.", "orderable": false},
                {"title": "CHG. W.", "orderable": false},
                {"title": "RATE PER KG", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false, className: "danger-header"},
                {"title": "TO", "orderable": false, className: "danger-header"},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "DEADLINE", "orderable": false},
                {"title": "CUT-OFF DATE", "orderable": false},
                {"title": "STATUS", "orderable": false},
                {"title": "FORWARDER", "orderable": false},
                {"title": "NOTES", "orderable": false},
                {
                    "title": "Con group",
                    "visible": false
                },
                {
                    "title": "Group Color",
                    "visible": false
                },
                {
                    "title": "Group Cost",
                    "visible": false
                },
                {
                    "title": "Sum Chargable Weight",
                    "visible": false
                },
                {
                    "title": "ACTIONS", "orderable": false,
                    "defaultContent": "<i class='fa fa-search con-edit action-btn' style='cursor: pointer'></i><i class='fa fa-check confirm-consolidation action-btn' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "rowCallback": function (row, data, index) {

                $('td', row).css('background-color', data[25]);

            },
            "order": [[24, 'asc']],
            "pageLength": 25,

        });


        $('#consolidations_table').on('click', 'i.con-edit', function () {

            $('#add-consolidation-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = consolidation_table.row($(this).parents('tr')).data();
            self.Helpers.initliazeModalToEditConsolidation(self.divisions, self.ports, self.products, self.vessels, self.cities, data);
            $('#save-job-btn').unbind('click')
            $('#save-job-btn').on('click', function () {


                $(this).attr('disabled', 'disabled')
                var modeSelectValue = $('#mode-select').val()
                var divisionSelectValue = $('#division-select').val()
                var productSelectValue = $('#product-select').val()
                var vesselSelectValue = $('#vessel-select').val()
                var actualWeight = $('#actual_weight').val()
                var volumeWeight = $('#volume_weight').val()
                var cutoffDate = $('#cutoff_date').val()
                var deadlinedate = $('#deadline_date').val()
                var forwarder = $('#forwarder').val()
                var reference = $('#forwarder').val()

                if (modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && actualWeight != '' && volumeWeight != '' && cutoffDate != '' && deadlinedate !='' && forwarder != '' && reference != '') {

                    $(this).attr('disabled', 'disabled')
                    var ind_ex = '';
                    var ind_to = '';
                    if (modeSelectValue == "Air") {

                        ind_ex = $('#ex-select-airport').val();
                        ind_to = $('#to-select-airport').val();

                    } else if (modeSelectValue == "Sea") {

                        ind_ex = $('#ex-select-port').val();
                        ind_to = $('#to-select-port').val();


                    } else {

                        ind_ex = $('#ex-input').val();
                        ind_to = $('#to-input').val();

                    }

                    if (ind_ex != '' && ind_to != '') {
                        var consolidationData = {
                            con_id: data[0],
                            con_user_id: self.Helpers.user_id,
                            con_division_id: divisionSelectValue,
                            con_product_id: productSelectValue,
                            con_mode: modeSelectValue,
                            con_reference: reference,
                            con_actual_weight: actualWeight,
                            con_length: ($('#length').val() == "") ? 0 : $('#length').val(),
                            con_width: ($('#width').val() == "") ? 0 : $('#width').val(),
                            con_height: ($('#height').val() == "") ? 0 : $('#height').val(),
                            con_pieces: ($('#pieces').val() == "") ? 0 : $('#pieces').val(),
                            con_volume_weight: volumeWeight,
                            con_chargable_weight: (volumeWeight > actualWeight) ? volumeWeight : actualWeight,
                            con_vessel_id: vesselSelectValue,
                            con_ex: ind_ex,
                            con_to: ind_to,
                            con_request_date: self.Helpers.getDateTimeNow(),
                            con_deadline: self.Helpers.changeDateToMysql($('#deadline_date').val()),
                            con_cut_off_date: self.Helpers.changeDateToMysql($('#cutoff_date').val()),
                            con_forwarder: $('#forwarder').val(),
                            con_notes: $('#notes').val(),
                            con_carrier: ($('#carrier').val() == "") ? null : $('#carrier').val()


                        }

                        self.updateConsolidation(consolidationData);
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

        $('#consolidations_table').on('click', 'i.costs-job', function () {

            $('#consolidation-cost-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = consolidation_table.row($(this).closest('tr')).data();

            if (data[26] == "" || data[26] == null) {

                $('#group-cost-div').hide();
            } else {

                $('#group-cost-div').show();

            }

            $('#consolidation_group_cost').val(self.Helpers.formatFloatValue(String(data[26])))
            $('#consolidation_id').val(data[24])
            $('#con_job_id').val(data[0])
            var sum_chargable_weight = data[27]
            var chargable_weight = data[13]
            var ratePerKG = data[26] / sum_chargable_weight

            var shared_cost = (chargable_weight / sum_chargable_weight) * data[26]

            $('#shared_consolidation_cost').val(shared_cost.toFixed(2))
            $('#rate_per_kg').val(ratePerKG.toFixed(2))
            $('#consolidation-cost-modal').modal('show');
        })

        $('#consolidations_table').on('click', 'i.confirm-consolidation', function () {

                var data = consolidation_table.row($(this).closest('tr')).data();

                if (data[26] != 0 && data[26] != '' && data[26] !== null) {

                    swal({
                        title: "Are you sure?",
                        text: "If you confirm this group you will not be able to edit it!",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonText: "Cancel",
                        confirmButtonColor: "#dc3545",
                        confirmButtonText: "Confirm",

                    }, function () {

                        self.confirmConsolidationGroup(data[24]);

                    })

                } else {

                    swal({
                        title: "Unable to confirm this group.",
                        text: "Some group data are empty. Please fill the missing data and try again. ",
                        type: "error",
                        showCancelButton: true,
                        showConfirmButton: false


                    })


                }


            }
        )

        $("#search_datatable").keyup(function () {
            consolidation_table.search($(this).val()).draw();
        });


    })


    connection.end()

}

DbClass.prototype.getAllDivisions = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM divisions'

    connection.query(sql, function (error, divisions) {
        if (error) throw error;

        self.divisions = divisions;


    });

    connection.end();


}

DbClass.prototype.getAllProducts = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM products'

    connection.query(sql, function (error, products) {
        if (error) throw error;


        self.products = products;

    });

    connection.end();


}

DbClass.prototype.getAllVessels = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM vessels ORDER BY vessel_description'

    connection.query(sql, function (error, vessels) {
        if (error) throw error;


        self.vessels = vessels;

    });

    connection.end();


}

DbClass.prototype.getAllColors = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM colors'

    connection.query(sql, function (error, colors) {
        if (error) throw error;


        self.colors = colors;


    });

    connection.end();


}

DbClass.prototype.getAllCities = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM cities order by city_name'

    connection.query(sql, function (error, cities) {
        if (error) throw error;


        self.cities = cities;


    });

    connection.end();


}

DbClass.prototype.addIndividual = function (indiavidualObject) {

    let self = this;
    var sql = 'INSERT INTO individuals (' +
        'ind_user_id, ' +
        'ind_division_id, ' +
        'ind_products, ' +
        'ind_mode, ' +
        'ind_vessels, ' +
        'ind_ex, ' +
        'ind_to, ' +
        'ind_request_date, ' +
        'ind_deadline, ' +
        'ind_forwarder, ' +
        'ind_status, ' +
        'ind_reference, ' +
        'ind_kg, ' +
        'ind_estimate_cost, ' +
        'ind_notes, ' +
        'ind_deleted' + ') VALUES (' +
        indiavidualObject.ind_user_id + ', ' +
        indiavidualObject.ind_division_id + ', "' +
        indiavidualObject.ind_products + '", "' +
        indiavidualObject.ind_mode + '", "' +
        indiavidualObject.ind_vessels + '", ' +
        indiavidualObject.ind_ex + ', ' +
        indiavidualObject.ind_to + ', "' +
        self.Helpers.getDateTimeNow() + '", "' +
        indiavidualObject.ind_deadline + '", "' +
        indiavidualObject.ind_forwarder + '", "' +
        "Pending" + '", "' +
        indiavidualObject.ind_reference + '", ' +
        indiavidualObject.ind_kg + ', ' +
        indiavidualObject.ind_estimate_cost + ', "' +
        indiavidualObject.ind_notes + '", 0)'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-job-btn').attr('disabled', null)
            self.Helpers.toastr('error', 'Unable to add this job.')
            throw  error;

        } else {

            $('#jobs_table').DataTable().clear();
            $('#jobs_table').DataTable().destroy();
            $('#add-job-modal').modal('hide')
            self.handleIndividualGroups(indiavidualObject, result.insertId)


        }

    });

    connection.end()


}

DbClass.prototype.addPersonnel = function (personnelObject) {

    let self = this;
    var sql = 'INSERT INTO personnel (' +
        'per_user_id, ' +
        'per_division_id, ' +
        'per_products, ' +
        'per_mode, ' +
        'per_name, ' +
        'per_vessels, ' +
        'per_ex, ' +
        'per_to, ' +
        'per_request_date, ' +
        'per_deadline, ' +
        'per_status, ' +
        'per_estimate_cost, ' +
        'per_actual_cost, ' +
        'per_saving, ' +
        'per_notes, ' +
        'per_kg, ' +
        'per_deleted' + ') VALUES (' +
        personnelObject.per_user_id + ', ' +
        personnelObject.per_division_id + ', "' +
        personnelObject.per_products + '", "' +
        personnelObject.per_mode + '", "' +
        personnelObject.per_name + '", "' +
        personnelObject.per_vessels + '", ' +
        personnelObject.per_ex + ', ' +
        personnelObject.per_to + ', "' +
        self.Helpers.getDateTimeNow() + '", "' +
        personnelObject.per_deadline + '", "' +
        "Pending" + '", ' +
        personnelObject.per_estimate_cost + ', ' +
        personnelObject.per_actual_cost + ', ' +
        personnelObject.per_savings + ',"' +
        personnelObject.per_notes + '", ' +
        personnelObject.per_kg + ', 0)'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-per-btn').attr('disabled', null)
            self.Helpers.toastr('error', 'Unable to add this job.')
            throw  error;

        } else {

            $('#personnel_table').unbind('click')
            $('#personnel_table').DataTable().clear();
            $('#personnel_table').DataTable().destroy();
            $('#add-per-modal').modal('hide')
            self.getAllPersonnel()

        }

    });

    connection.end()


}

DbClass.prototype.addConsolidation = function (consolidationObj) {

    let self = this;

    var sql = 'INSERT INTO consolidations (' +
        'con_user_id, ' +
        'con_division_id, ' +
        'con_product_id, ' +
        'con_mode, ' +
        'con_reference, ' +
        'con_actual_weight, ' +
        'con_length, ' +
        'con_width, ' +
        'con_height, ' +
        'con_pieces, ' +
        'con_volume_weight, ' +
        'con_chargable_weight, ' +
        'con_vessel_id, ' +
        'con_ex, ' +
        'con_to, ' +
        'con_request_date, ' +
        'con_deadline, ' +
        'con_cut_off_date, ' +
        'con_status, ' +
        'con_carrier,' +
        'con_notes,' +
        'con_group_id' +
        ') VALUES (' +
        consolidationObj.con_user_id + ', ' +
        consolidationObj.con_division_id + ', ' +
        consolidationObj.con_product_id + ', "' +
        consolidationObj.con_mode + '", "' +
        consolidationObj.con_reference + '", ' +
        consolidationObj.con_actual_weight + ', ' +
        consolidationObj.con_length + ', ' +
        consolidationObj.con_width + ', ' +
        consolidationObj.con_height + ', ' +
        consolidationObj.con_pieces + ', ' +
        consolidationObj.con_volume_weight + ', ' +
        consolidationObj.con_chargable_weight + ', ' +
        consolidationObj.con_vessel_id + ', "' +
        consolidationObj.con_ex + '", "' +
        consolidationObj.con_to + '", "' +
        consolidationObj.con_request_date + '", "' +
        consolidationObj.con_deadline + '", "' +
        consolidationObj.con_cut_off_date + '", "' +
        "Pending" + '", "' +
        consolidationObj.con_carrier + '", "' +
        consolidationObj.con_notes + '", 0)'


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-job-btn').attr('disabled', null)
            self.Helpers.toastr('error', 'Unable to add this job.')
            throw  error;

        } else {
            $('#add-consolidation-modal').modal('hide')

            self.handleConsolidationsGroups(consolidationObj, result.insertId)


        }

    });

    connection.end()


}

DbClass.prototype.updateJob = function (jobObject) {

    let self = this;


    var sql = 'UPDATE individuals SET ' +
        'ind_division_id = ' + jobObject.ind_division_id + ', ' +
        'ind_products = "' + jobObject.ind_products + '", ' +
        'ind_mode = "' + jobObject.ind_mode + '", ' +
        'ind_vessels = "' + jobObject.ind_vessels + '", ' +
        'ind_ex = ' + jobObject.ind_ex + ', ' +
        'ind_to = ' + jobObject.ind_to + ', ' +
        'ind_deadline = "' + jobObject.ind_deadline + '", ' +
        'ind_forwarder = "' + jobObject.ind_forwarder + '", ' +
        'ind_reference = "' + jobObject.ind_reference + '", ' +
        'ind_kg = ' + jobObject.ind_kg + ', ' +
        'ind_estimate_cost = ' + jobObject.ind_estimate_cost + ', ' +
        'ind_notes = "' + jobObject.ind_notes + '",' +
        'ind_group_id = 0' +
        ' WHERE ind_id = ' + jobObject.ind_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-job-btn').attr('disabled', null)
            alert('Unable to modify job.')
            throw error

        } else {

            $('#add-job-modal').modal('hide')
            $('#jobs_table').DataTable().clear();
            $('#jobs_table').DataTable().destroy();
            self.handleIndividualGroupsUpdate(jobObject)

        }

    });

    connection.end()

}

DbClass.prototype.updatePersonnel = function (personnelData) {

    let self = this;


    var sql = 'UPDATE personnel SET ' +
        'per_division_id = ' + personnelData.per_division_id + ', ' +
        'per_products = "' + personnelData.per_products + '", ' +
        'per_mode = "' + personnelData.per_mode + '", ' +
        'per_name = "' + personnelData.per_name + '", ' +
        'per_vessels = "' + personnelData.per_vessels + '", ' +
        'per_ex = ' + personnelData.per_ex + ', ' +
        'per_to = ' + personnelData.per_to + ', ' +
        'per_deadline = "' + personnelData.per_deadline + '", ' +
        'per_estimate_cost = ' + personnelData.per_estimate_cost + ', ' +
        'per_actual_cost = ' + personnelData.per_actual_cost + ', ' +
        'per_saving = ' + personnelData.per_savings + ', ' +
        'per_notes = "' + personnelData.per_notes + '", ' +
        'per_kg = ' + personnelData.per_kg +
        ' WHERE per_id = ' + personnelData.per_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-per-btn').attr('disabled', null)
            alert('Unable to modify job.')
            throw error

        } else {

            $('#add-per-modal').modal('hide')
            $('#personnel_table').unbind('click')
            $('#personnel_table').DataTable().clear();
            $('#personnel_table').DataTable().destroy();
            self.getAllPersonnel()
        }

    });

    connection.end()

}

DbClass.prototype.updateConsolidation = function (jobObject) {

    let self = this;

    var chargable_weight = 0;

    if (jobObject.con_volume_weight > jobObject.con_actual_weight) {

        chargable_weight = jobObject.con_volume_weight

    } else {

        chargable_weight = jobObject.con_actual_weight
    }


    var sql = 'UPDATE consolidations SET ' +
        'con_division_id = ' + jobObject.con_division_id + ', ' +
        'con_product_id = ' + jobObject.con_product_id + ', ' +
        'con_mode = "' + jobObject.con_mode + '", ' +
        'con_reference = "' + jobObject.con_reference + '", ' +
        'con_actual_weight = ' + jobObject.con_actual_weight + ', ' +
        'con_length = ' + jobObject.con_length + ', ' +
        'con_width = ' + jobObject.con_width + ', ' +
        'con_height = ' + jobObject.con_height + ', ' +
        'con_pieces = ' + jobObject.con_pieces + ', ' +
        'con_volume_weight = ' + jobObject.con_volume_weight + ', ' +
        'con_chargable_weight = ' + chargable_weight + ', ' +
        'con_vessel_id = ' + jobObject.con_vessel_id + ', ' +
        'con_ex = "' + jobObject.con_ex + '", ' +
        'con_to = "' + jobObject.con_to + '", ' +
        'con_deadline = "' + jobObject.con_deadline + '", ' +
        'con_cut_off_date = "' + jobObject.con_cut_off_date + '", ' +
        'con_forwarder = "' + jobObject.con_forwarder + '", ' +
        'con_notes = "' + jobObject.con_notes + '",' +
        'con_carrier = "' + jobObject.con_carrier + '"' +
        ' WHERE con_id = ' + jobObject.con_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            $('#save-job-btn').attr('disabled', null)
            alert('Unable to modify job.')
            throw error

        } else {
            $('#add-consolidation-modal').modal('hide')
            self.handleConsolidationsGroups(jobObject, jobObject.con_id)
        }

    });

    connection.end()

}

DbClass.prototype.confirmIndividualGroup = function (groupID) {

    let self = this;

    var sql = 'UPDATE individuals SET ' +
        'ind_status = "Done", ' +
        'ind_confirmation_date = "' + self.Helpers.getDateTimeNow() + '"' +
        ' WHERE ind_group_id = ' + groupID + ' AND ind_deleted = 0; UPDATE individual_groups SET ind_group_active = 0, ind_group_confirmation_date = "' + self.Helpers.getDateTimeNow() + '" WHERE ind_group_id = ' + groupID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            alert('Unable to confirm job.')
            throw error

        } else {

            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear();
            $('#jobs_table').DataTable().destroy();
            self.Helpers.toastr('success', 'Job confirmed successfully.')
            self.getAllIndividuals();
        }

    });

    connection.end()


}

DbClass.prototype.saveNotesChanges = function (jobID, noteText) {

    let self = this;

    var sql = 'UPDATE individuals SET ' +
        'ind_notes = "' + noteText + '" ' +
        ' WHERE ind_id = ' + jobID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            alert('Unable to modify notes.')
            throw error

        } else {

            $('#notes-modal').modal('hide')
            $('#done_individuals_table').unbind('click')
            $('#done_individuals_table').DataTable().clear();
            $('#done_individuals_table').DataTable().destroy();
            self.getAllDoneIndividuals();

        }

    });

    connection.end()


}

DbClass.prototype.savePerNotesChanges = function (jobID, noteText) {

    let self = this;

    var sql = 'UPDATE personnel SET ' +
        'per_notes = "' + noteText + '" ' +
        ' WHERE per_id = ' + jobID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            alert('Unable to modify notes.')
            throw error

        } else {

            $('#notes-modal').modal('hide')
            $('#done_personnel_table').unbind('click')
            $('#done_personnel_table').DataTable().clear();
            $('#done_personnel_table').DataTable().destroy();
            self.getAllDonePersonnel();

        }

    });

    connection.end()


}

DbClass.prototype.saveConsolidationNotes = function (jobID, noteText) {

    let self = this;

    var sql = 'UPDATE consolidations SET ' +
        'con_notes = "' + noteText + '" ' +
        ' WHERE con_id = ' + jobID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            alert('Unable to modify notes.')
            throw error

        } else {

            $('#notes-modal').modal('hide')
            $('#done_consolidations_table').unbind('click')
            $('#done_consolidations_table').DataTable().clear();
            $('#done_consolidations_table').DataTable().destroy();
            self.getAllDoneConsolidations();

        }

    });

    connection.end()


}

DbClass.prototype.handleIndividualGroups = function (individualData, insertedID) {

    let self = this;

    var sql = 'SELECT * FROM individual_groups WHERE ' +
        'ind_group_ex = "' + individualData.ind_ex + '" AND ' +
        'ind_group_to = "' + individualData.ind_to + '" AND ' +
        'ind_group_deadline = "' + individualData.ind_deadline + '" AND ' +
        'ind_group_active = 1';

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, groupResults) {
        if (error) {

            alert('Unable to manage groups.')
            throw error

        } else {

            if (groupResults.length == 0) {

                var insert_sql = 'INSERT INTO individual_groups ' +
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_deadline, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex + '", "' +
                    individualData.ind_to + '", "' +
                    individualData.ind_deadline + '", 1)';

                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true
                });
                insertConnection.query(insert_sql, function (error, insertResult) {
                    if (error) {

                        throw error;

                    } else {

                        var new_sql = 'UPDATE individuals set ind_group_id = ' + insertResult.insertId + ', ind_is_grouped = 0 WHERE ind_id = ' + insertedID;

                        var newConnection = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true
                        });
                        newConnection.query(new_sql, function (error) {
                            if (error)
                                throw error;
                            self.checkIfThereIsOneJobAloneGrouped();

                        });

                        newConnection.end();

                    }


                });

                insertConnection.end();


            } else {

                if (groupResults[0].ind_group_color == 'empty') {

                    var randomNumber = Math.floor(Math.random() * (self.colors.length - 1));

                    var updateGroups = 'UPDATE individual_groups SET ind_group_color = "' + self.colors[randomNumber].color_code + '" WHERE ind_group_id = ' + groupResults[0].ind_group_id;

                    var updateConnections = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true
                    });
                    updateConnections.query(updateGroups, function (error) {
                        if (error) {

                            throw error;

                        } else {

                            var new_sql = 'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ' WHERE ind_id = ' + insertedID + ';' +
                                'UPDATE individuals set ind_is_grouped = 1 WHERE ind_group_id = ' + groupResults[0].ind_group_id;


                            var newConnection = mysql.createConnection({
                                host: self.serverIP,
                                user: self.user,
                                password: self.dbpass,
                                database: self.database,
                                port: self.port,
                                dateStrings: true,
                                multipleStatements: true
                            });
                            newConnection.query(new_sql, function (error) {
                                if (error)
                                    throw error;
                                self.checkIfThereIsOneJobAloneGrouped();

                            });

                            newConnection.end();

                        }


                    });

                    updateConnections.end();


                } else {

                    var new_sql = 'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ', ind_is_grouped = 1 WHERE ind_id = ' + insertedID;

                    var newConnection = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true
                    });
                    newConnection.query(new_sql, function (error) {
                        if (error)
                            throw error;
                        self.checkIfThereIsOneJobAloneGrouped();

                    });

                    newConnection.end();


                }


            }


        }

    });

    connection.end()


}

DbClass.prototype.handleIndividualGroupsUpdate = function (individualData) {

    let self = this;

    var sql = 'SELECT *, ' +
        '(Select count(*) FROM individuals WHERE ind_group_id = individual_groups.ind_group_id AND ind_status = "Pending") as individual_count' +
        ' FROM individual_groups WHERE ' +
        'ind_group_ex = "' + individualData.ind_ex + '" AND ' +
        'ind_group_to = "' + individualData.ind_to + '" AND ' +
        'ind_group_deadline = "' + individualData.ind_deadline + '" AND ' +
        'ind_group_active = 1';

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();
    connection.query(sql, function (error, groupResults) {
        if (error) {

            alert('Unable to manage groups.')
            throw error

        } else {

            if (groupResults.length == 0) {

                var insert_sql = 'INSERT INTO individual_groups ' +
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_deadline, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex + '", "' +
                    individualData.ind_to + '", "' +
                    individualData.ind_deadline + '", 1)';


                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true
                });
                insertConnection.query(insert_sql, function (error, insertResult) {
                    if (error) {

                        alert('Unable to manage groups.')
                        throw error;

                    } else {

                        var new_sql = 'UPDATE individuals set ind_group_id = ' + insertResult.insertId + ', ind_is_grouped = 0 WHERE ind_id = ' + individualData.ind_id;

                        var newConnection = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true
                        });
                        newConnection.query(new_sql, function (error) {
                            if (error)
                                throw error;
                            self.checkIfThereIsOneJobAloneGrouped();


                        });

                        newConnection.end();

                    }


                });

                insertConnection.end();


            } else {


                if (groupResults[0].ind_group_color == 'empty') {

                    if (groupResults[0].individual_count != 0) {

                        var randomNumber = Math.floor(Math.random() * 29) + 1;

                        var updateGroups = 'UPDATE individual_groups SET ind_group_color = "' + self.colors[randomNumber].color_code + '" WHERE ind_group_id = ' + groupResults[0].ind_group_id;

                        var updateConnections = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true
                        });
                        updateConnections.query(updateGroups, function (error) {
                            if (error) {

                                throw error;

                            } else {

                                var new_sql = 'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ', ind_is_grouped = 1 WHERE ind_id = ' + individualData.ind_id + ';' +
                                    'UPDATE individuals set ind_is_grouped = 1 WHERE ind_group_id = ' + groupResults[0].ind_group_id;


                                var newConnection = mysql.createConnection({
                                    host: self.serverIP,
                                    user: self.user,
                                    password: self.dbpass,
                                    database: self.database,
                                    port: self.port,
                                    dateStrings: true,
                                    multipleStatements: true
                                });
                                newConnection.query(new_sql, function (error) {
                                    if (error)
                                        throw error;
                                    self.checkIfThereIsOneJobAloneGrouped();

                                });

                                newConnection.end();

                            }


                        });

                        updateConnections.end();


                    } else {

                        var ungroup_sql = 'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ', ind_is_grouped = 0 WHERE ind_id = ' + individualData.ind_id + ';'

                        var ungrouConn = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                            multipleStatements: false
                        });
                        ungrouConn.query(ungroup_sql, function (error) {
                            if (error)
                                throw error;
                            self.checkIfThereIsOneJobAloneGrouped();


                        });

                        ungrouConn.end();

                    }


                } else {

                    var new_sql = 'UPDATE individuals set ind_group_id = ' + groupResults[0].ind_group_id + ', ind_is_grouped = 1 WHERE ind_id = ' + individualData.ind_id + ';'

                    var newConnection = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: self.dbpass,
                        database: self.database,
                        port: self.port,
                        dateStrings: true,
                        multipleStatements: false
                    });
                    newConnection.query(new_sql, function (error) {
                        if (error)
                            throw error;
                        self.checkIfThereIsOneJobAloneGrouped();


                    });

                    newConnection.end();


                }


            }
        }

    });

    connection.end()


}

DbClass.prototype.checkIfThereIsOneJobAloneGrouped = function () {

    let self = this;
    var mysql = require('mysql');
    var check_sql = 'Select ind_group_id, count(*) as ind_count from individuals ' +
        'WHERE ind_is_grouped = 1 AND ind_status = "Pending" AND ind_deleted = 0 ' +
        'group by ind_group_id;'

    var newConnection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });
    newConnection.query(check_sql, function (error, individuals) {
        if (error)
            throw error;

        for (i = 0; i < individuals.length; i++) {
            if (individuals[i].ind_count == 1) {
                console.log(individuals[i].ind_group_id)
                var ungroup_sql = 'UPDATE individual_groups SET ind_group_color = "empty" WHERE ind_group_id = ' + individuals[i].ind_group_id + ';' + 'UPDATE individuals set ind_is_grouped = 0 WHERE ind_group_id = ' + individuals[i].ind_group_id + '; '


                var ungrouConn = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true,
                    multipleStatements: true
                });
                ungrouConn.query(ungroup_sql, function (error) {
                    if (error)
                        throw error;
                    $('#jobs_table').unbind('click')
                    $('#jobs_table').DataTable().clear();
                    $('#jobs_table').DataTable().destroy();
                    self.Helpers.toastr('success', 'Job added successfully.')
                    self.getAllIndividuals();


                });

                ungrouConn.end();


            }


        }
        $('#jobs_table').unbind('click')
        $('#jobs_table').DataTable().clear();
        $('#jobs_table').DataTable().destroy();
        self.Helpers.toastr('success', 'Job added successfully.')
        self.getAllIndividuals();


    });

    newConnection.end();


}

DbClass.prototype.updateGroupCost = function (groupCostData) {

    let self = this;

    var sql = 'UPDATE individual_groups SET ind_group_cost = ' + groupCostData.ind_group_cost + ', ind_group_deadline = "' + groupCostData.ind_group_deadline + '"' + ', ind_group_forwarder = "' + groupCostData.ind_group_forwarder + '" ' +  ', ind_group_to = ' + groupCostData.ind_group_to + ', ind_group_active = 0 ' +
        ' WHERE ind_group_id = ' + groupCostData.ind_group_id  + ';' +
        ' UPDATE individuals SET ind_ex = ' + groupCostData.ind_group_ex + ', ind_to = ' + groupCostData.ind_group_to +  ', ind_deadline = "' + groupCostData.ind_group_deadline + '" WHERE ind_group_id = ' + groupCostData.ind_group_id  + ';'


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to update job cost')
            throw error

        } else {

            var searchIndSql = 'Select * from individuals WHERE ind_ex = ' + groupCostData.ind_group_ex + ' AND ind_to = ' + groupCostData.ind_group_to + ' AND ind_deadline = "' + groupCostData.ind_group_deadline + '" AND ind_group_id != ' +  groupCostData.ind_group_id + ' AND ind_deleted = 0 AND ind_status = "Pending"';

            var mysql = require('mysql');

            var indConnection = mysql.createConnection({
                host: self.serverIP,
                user: self.user,
                password: self.dbpass,
                database: self.database,
                port: self.port,
                dateStrings: true,
            });

            indConnection.connect();
            indConnection.query(searchIndSql, function (error, indToChangeGroup) {
                if (error) {

                    alert('Unable to update job cost')
                    throw error

                } else {
                    console.log(indToChangeGroup)
                    for (let i=0; i < indToChangeGroup.length; i++) {

                        var changeIndividualSql = 'UPDATE individuals SET ind_is_grouped = 1, ind_group_id = ' + groupCostData.ind_group_id + ' WHERE ind_id = ' + indToChangeGroup[i].ind_id + ';' +
                            ' DELETE FROM individual_groups WHERE ind_group_id = ' + indToChangeGroup[i].ind_group_id;

                        var mysql = require('mysql');

                        var indGrpConn = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true,
                            multipleStatements: true
                        });
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
                    $('#jobs_table').DataTable().clear();
                    $('#jobs_table').DataTable().destroy();
                    self.Helpers.toastr('success', 'Costs updated successfully.')
                    self.getAllIndividuals();


                }
            });
            indConnection.end()

        }

    });

    connection.end()


}

DbClass.prototype.handleConsolidationsGroups = function (consolidationObj, insertedID) {

    let self = this;

    var sql = 'SELECT * FROM consolidation_groups WHERE ' +
        'con_group_ex = "' + consolidationObj.con_ex + '" AND ' +
        'con_group_to = "' + consolidationObj.con_to + '" AND ' +
        'con_group_active = 1';

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, groupResults) {
        if (error) {

            alert('Unable to manage groups.')
            throw error

        } else {

            if (groupResults.length == 0) {

                var randomNumber = Math.floor(Math.random() * 29) + 1;

                var insert_sql = 'INSERT INTO consolidation_groups ' +
                    '(con_group_color, con_group_ex, con_group_to, con_group_active) VALUES ' +
                    '("' + self.colors[randomNumber].color_code + '","' +
                    consolidationObj.con_ex + '", "' +
                    consolidationObj.con_to + '", 1)';


                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true
                });
                insertConnection.query(insert_sql, function (error, insertResult) {
                    if (error) {

                        throw error;

                    } else {

                        var new_sql = 'UPDATE consolidations set con_group_id = ' + insertResult.insertId + ' WHERE con_id = ' + insertedID;

                        var newConnection = mysql.createConnection({
                            host: self.serverIP,
                            user: self.user,
                            password: self.dbpass,
                            database: self.database,
                            port: self.port,
                            dateStrings: true
                        });
                        newConnection.query(new_sql, function (error) {
                            if (error)
                                throw error;

                            $('#consolidations_table').unbind('click')
                            $('#consolidations_table').DataTable().clear();
                            $('#consolidations_table').DataTable().destroy();
                            self.getAllConsolidations();

                        });

                        newConnection.end();

                    }


                });

                insertConnection.end();


            } else {

                var new_sql = 'UPDATE consolidations set con_group_id = ' + groupResults[0].con_group_id + ' WHERE con_id = ' + insertedID;

                var newConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: self.dbpass,
                    database: self.database,
                    port: self.port,
                    dateStrings: true
                });
                newConnection.query(new_sql, function (error) {
                    if (error)
                        throw error;
                    $('#consolidations_table').unbind('click')
                    $('#consolidations_table').DataTable().clear();
                    $('#consolidations_table').DataTable().destroy();
                    self.getAllConsolidations();

                });

                newConnection.end();


            }


        }


    });

    connection.end()


}

DbClass.prototype.updateConsolidationGroupCost = function (groupCostData) {

    let self = this;

    var sql = 'UPDATE consolidation_groups SET ' +
        'con_group_cost = ' + groupCostData.con_group_cost + ', ' +
        'con_group_forwarder = "' + groupCostData.con_group_forwarder + '" ' +
        ' WHERE con_group_id = ' + groupCostData.con_group_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to update job cost')
            throw error

        } else {

            $('#consolidations_table').unbind('click')
            $('#consolidations_table').DataTable().clear();
            $('#consolidations_table').DataTable().destroy();
            self.getAllConsolidations();
        }

    });

    connection.end()


}

DbClass.prototype.confirmConsolidationGroup = function (groupID) {

    let self = this;

    var sql = 'UPDATE consolidations SET ' +
        'con_status = "Done", ' +
        'con_confirmation_date = "' + self.Helpers.getDateTimeNow() + '"' +
        ' WHERE con_group_id = ' + groupID + '; UPDATE consolidation_groups SET con_group_active = 0, con_group_confirmation_date = "' + self.Helpers.getDateTimeNow() + '" WHERE con_group_id = ' + groupID;




    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error, result) {
        if (error) {

            alert('Unable to confirm job.')
            throw error

        } else {

            $('#consolidations_table').unbind('click')
            $('#consolidations_table').DataTable().clear();
            $('#consolidations_table').DataTable().destroy();
            self.getAllConsolidations();
        }

    });

    connection.end()


}


DbClass.prototype.addCity = function (cityName) {

    let self = this;

    var sql = 'INSERT INTO cities (city_name) VALUES ("' + cityName + '");'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to add city.')
            throw error

        } else {

            self.Helpers.toastr('success', 'City added successfully.')


        }

    });

    connection.end()

}

DbClass.prototype.addVessel = function (vesselName) {

    let self = this;

    var sql = 'INSERT INTO vessels (vessel_description) VALUES ("' + vesselName + '");'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to add vessel.')
            throw error

        } else {

            self.Helpers.toastr('success', 'Vessel added successfully.')
            setTimeout(function() {
                window.location.reload()
            }, 2000)
        }

    });

    connection.end()

}

DbClass.prototype.getManagerData = function (fromDate, toDate) {

    let self = this;

    var sql = 'Select ' +
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
        'WHERE ind_jobs.ind_status = "Done" AND ind_jobs.ind_confirmation_date BETWEEN "' + self.Helpers.changeDateToMysql(fromDate) + '" AND "' + self.Helpers.changeDateToMysql(toDate, 1) + '";'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error, ind_result) {
        if (error) {
            throw  error;
            connection.end()
        }

        var con_sql = 'Select ' +
            'divisions.division_id, ' +
            'divisions.division_description, ' +
            'cons.con_chargable_weight, ' +
            'cons.con_group_id, ' +
            'con_groups.con_group_cost, ' +
            '(SELECT sum(consolidations.con_chargable_weight) FROM consolidations WHERE con_group_id = cons.con_group_id) as consolidation_group_weight ' +
            ' from consolidations as cons ' +
            ' JOIN consolidation_groups as con_groups on cons.con_group_id = con_groups.con_group_id ' +
            ' JOIN divisions as divisions on divisions.division_id = cons.con_division_id ' +
            ' WHERE cons.con_status = "Done" AND cons.con_confirmation_date BETWEEN "' + self.Helpers.changeDateToMysql(fromDate) + '" and "' + self.Helpers.changeDateToMysql(toDate) + '";'


        connection.query(con_sql, function (error, con_result) {
            if (error) throw error;

            self.initializeManagerTable(ind_result, con_result)


        })
        connection.end()

    });


}

DbClass.prototype.initializeManagerTable = function (indData, conData) {
    let self = this;

    var dataset = [];
    var total_estimate_cost = 0;
    var total_shared_cost = 0;
    var total_individual_cost = 0;
    var total_con_cost = 0;
    var total_grouped_cost = 0;

    //full summaries for last line
    var estimateCostSum = 0;
    var totalCostSum = 0;

    console.log(indData)
    console.log(conData)
    for (i = 0; i < self.divisions.length; i++) {

        dataset[i] = [];
        dataset[i].push(self.divisions[i].division_description)
        var division_cost = 0;
        var division_con_cost = 0;
        var division_ind_cost = 0;
        var division_estimate_cost = 0;
        var division_shared_cost = 0;
        var division_savings = 0;

        for (j = 0; j < indData.length; j++) {

            if (indData[j].division_id == self.divisions[i].division_id) {

                if (indData[j].ind_is_grouped == 0) {

                    division_ind_cost = division_ind_cost + indData[j].ind_estimate_cost

                } else {

                    division_estimate_cost = division_estimate_cost + indData[j].ind_estimate_cost;
                    var sum_estimate_cost = (indData[j].individuals_estimated_cost)
                    var group_cost = (indData[j].ind_group_cost)

                    var savings_percent = ((1 - (group_cost / sum_estimate_cost)) * 100).toFixed(2)

                    var savings_amount = (parseFloat(indData[j].ind_estimate_cost) * savings_percent / 100)
                    var shared_cost = ((group_cost / sum_estimate_cost) * parseFloat(indData[j].ind_estimate_cost))

                    division_shared_cost = division_shared_cost + shared_cost;
                     division_cost = parseFloat(division_cost) + (shared_cost)
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
        dataset[i].push(division_estimate_cost.toFixed(2) + " €")
        dataset[i].push(division_shared_cost.toFixed(2) + " €")

        if (division_shared_cost == 0 || division_estimate_cost == 0) {
            var finalSavingPercent = 0.00
        } else {
            var finalSavingPercent = (100 - (division_shared_cost / division_estimate_cost) * 100).toFixed(2)
        }

        dataset[i].push(finalSavingPercent + " %")
        dataset[i].push(division_savings.toFixed(2) + " €")
        dataset[i].push(division_ind_cost.toFixed(2) + " €")
        dataset[i].push(division_con_cost.toFixed(2) + " €")
        dataset[i].push((division_ind_cost + division_con_cost + division_shared_cost).toFixed(2) + " €")
        total_estimate_cost = parseFloat(total_estimate_cost) + division_ind_cost + division_con_cost + division_estimate_cost
        total_shared_cost = parseFloat(total_shared_cost) + division_con_cost + division_ind_cost + division_shared_cost

        total_individual_cost = parseFloat(total_individual_cost) + division_ind_cost;
        total_con_cost = parseFloat(total_con_cost) + division_con_cost;
        total_grouped_cost = parseFloat(total_grouped_cost) + division_shared_cost;

        //Calculations for totals
        estimateCostSum = parseFloat(estimateCostSum) + division_estimate_cost;
        totalCostSum = parseFloat(totalCostSum) + division_ind_cost + division_con_cost + division_shared_cost

    }
    dataset[9]= [];
    dataset[9].push("<b>Totals €</b>")
    dataset[9].push("<b>" + estimateCostSum.toFixed(2) + " €" + "</b>")
    dataset[9].push("<b>" + total_grouped_cost.toFixed(2) + " €"+ "</b>")
    dataset[9].push("<b>" + (((estimateCostSum - total_grouped_cost) / estimateCostSum) * 100).toFixed(2) + ' %' + "</b>")
    dataset[9].push("<b>" +(estimateCostSum - total_grouped_cost).toFixed(2) + " €" + "</b>")
    dataset[9].push("<b>" +total_individual_cost.toFixed(2) + " €" + "</b>")
    dataset[9].push("<b>" +total_con_cost.toFixed(2) + " €" + "</b>")
    dataset[9].push("<b>" +totalCostSum.toFixed(2) + " €" + "</b>")
    var savingAmount = total_estimate_cost - total_shared_cost;
    var savinPercent =  savingAmount / total_estimate_cost * 100;

    $('#total_costs_per_period').html("€ " + total_estimate_cost.toFixed(2))
    $('#total_savings_per_period').html("€ " + total_shared_cost.toFixed(2))
    $('#savings_percentage').html(savinPercent.toFixed(2) + " %")
    $('#savings_amount').html('€ ' + savingAmount.toFixed(2))
    $('#general-data-div').show()


    var manager_table = $('#manager_data_table').DataTable({
        "data": dataset,
        "searching": false,
        "paging": false,
        "bInfo" : false,
        "bLengthChange": false,
        "columns": [
            {"title": "Department", "orderable": false},
            {"title": "Estimate Cost €", "orderable": false ,className: "success-header"},
            {"title": "Group Cost €", "orderable": false ,className: "success-header"},
            {"title": "Savings %", "orderable": false ,className: "success-header"},
            {"title": "Savings €", "orderable": false ,className: "success-header"},
            {"title": "Individual €", "orderable": false, className: "danger-header"},
            {"title": "Consolidation €", "orderable": false, className: "warning-header"},
            {"title": "Total Cost €", "orderable": false}
        ],
        "pageLength": 25,
        "order": [[0, 'asc']],

    });

    var total_individual_cost_per = (total_individual_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100;
    var total_con_cost_per = (total_con_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100;
    var total_grouped_cost_per = (total_grouped_cost / (total_individual_cost + total_con_cost + total_grouped_cost)) * 100;

    var myPie = document.getElementById('manager-pie').getContext('2d');



    var pieData = {
        datasets: [{
            data: [total_individual_cost.toFixed(2), total_con_cost.toFixed(2), total_grouped_cost.toFixed(2)],
            backgroundColor: [
                '#f65f6e', '#F8BC34', '#68bb69'
            ]
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Individual (' + total_individual_cost_per.toFixed(2) + "%)",
            'Consolidation (' + total_con_cost_per.toFixed(2) + "%)",
            'Grouped (' + total_grouped_cost_per.toFixed(2) + "%)"
        ],

    };

    if (self.pieCreated == true) {

        myPieChart.destroy();
    }
     myPieChart = new Chart(myPie, {
        type: 'pie',
        data: pieData,
        options: {}
    });
    self.pieCreated = true;


}

DbClass.prototype.deleteIndividual = function(individualData) {
    let self = this;

    var sql = 'UPDATE individuals set ind_deleted = 1, ind_date_deleted = now() WHERE ind_id = ' + individualData[0] + ';'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }
        if (individualData[16] === 1) {
            //the individual was grouped
            console.log("Individual was grouped.....")
            self.checkIfThereIsOneJobAloneGrouped();
        } else {
            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear();
            $('#jobs_table').DataTable().destroy();
            self.Helpers.toastr('success', 'Job deleted successfully.')
            self.getAllIndividuals();
        }
    })
    connection.end()


}

DbClass.prototype.deleteCity = function(city_id) {

    let self = this;

    var sql = 'DELETE FROM cities WHERE city_id = ' + city_id + ' LIMIT 1;'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }

        self.Helpers.toastr('success', 'City deleted')
        setTimeout(function() {
            window.location.reload()
        }, 2000)

    })
    connection.end()

}

DbClass.prototype.deleteVessel = function(vessel_id) {

    let self = this;

    var sql = 'DELETE FROM vessels WHERE vessel_id = ' + vessel_id + ' LIMIT 1;'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }
        self.Helpers.toastr('success', 'Vessel deleted')
        setTimeout(function() {
            window.location.reload()
        }, 2000)


    })
    connection.end()

}

DbClass.prototype.deletePersonnel = function(perData) {
    let self = this;

    var sql = 'UPDATE personnel set per_deleted = 1, per_date_deleted = now() WHERE per_id = ' + perData[0] + ';'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }

            $('#personnel_table').unbind('click')
            $('#personnel_table').DataTable().clear();
            $('#personnel_table').DataTable().destroy();
            self.getAllPersonnel();

    })
    connection.end()


}

DbClass.prototype.confirmPersonnel = function(per_id) {
    let self = this;

    var sql = 'UPDATE personnel set per_status = "Done", per_confirmation_date = now() WHERE per_id = ' + per_id + ';'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }

        $('#personnel_table').unbind('click')
        $('#personnel_table').DataTable().clear();
        $('#personnel_table').DataTable().destroy();
        self.getAllPersonnel();

    })
    connection.end()


}

DbClass.prototype.emptyDeletedIndividuals = function() {

    let self = this;

    var sql = 'DELETE FROM individuals WHERE ind_deleted = 1;'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: self.dbpass,
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {
            throw  error;
        }

        window.location.reload();

    })
    connection.end()
}

DbClass.prototype.initializeGroupCitySelect = function(exCityName, toCityName) {

    let self = this;

    let exSelectedId = 0;
    let toSelectedId = 0;
    $('#group-to-select').empty();
    $('#group-ex-select').empty();
    $('#group-to-select').append("<option></option>")
    $('#group-ex-select').append("<option></option>")
    for (i=0; i < self.cities.length; i++) {

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
    $('#group-ex-select').trigger("chosen:updated")
    $('#group-to-select').trigger("chosen:updated")
}






