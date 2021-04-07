let DbClass = function () {

    this.Helpers = new HelpersClass();
    this.serverIP = '';
    this.user = '';
    this.port = '';
    this.database = '';
    this.products = [];
    this.divisions = [];
    this.vessels = [];
    this.ports = [];
    this.colors = [];
    this.airports = [];
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


}

DbClass.prototype.verifyLogin = function (username, password) {

    let self = this;

    var mysql = require('mysql');
    var md5 = require('md5')

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' users.user_username,' +
        ' divisions.division_description,' +
        ' products.product_description,' +
        ' ind_jobs.ind_mode,' +
        ' ind_jobs.ind_carrier,' +
        ' vessels.vessel_description,' +
        ' ind_jobs.ind_ex as ex_port, ' +
        ' ind_jobs.ind_to as to_port,' +
        ' ind_jobs.ind_scheldure,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s" ) as ind_request_date,' +
        ' DATE_FORMAT(ind_jobs.ind_deadline, "%d/%m/%Y") as ind_deadline,' +
        ' DATE_FORMAT(ind_jobs.ind_cut_off_date, "%d/%m/%Y") as ind_cut_off_date,' +
        ' ind_jobs.ind_status,' +
        ' ind_jobs.ind_forwarder,' +
        ' ind_jobs.ind_type,' +
        ' Round(ind_jobs.ind_estimate_cost,2) as ind_estimate_cost,' +
        ' ind_jobs.ind_notes,' +
        ' ind_jobs.ind_group_id,' +
        ' ind_jobs.ind_is_grouped,' +
        ' individual_groups.ind_group_color,' +
        ' individual_groups.ind_group_cost,' +
        ' DATE_FORMAT(individual_groups.ind_group_cut_off_date, "%d/%m/%Y") as ind_group_cut_off_date,' +
        ' individual_groups.ind_group_forwarder, ' +
        ' (SELECT Round(sum(individuals.ind_estimate_cost),2) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id) as sum_estimated_cost' +
        ' FROM individuals as ind_jobs' +
        ' LEFT JOIN divisions on divisions.division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on users.user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN products on products.product_id = ind_jobs.ind_product_id' +
        ' LEFT JOIN vessels on vessels.vessel_id = ind_jobs.ind_vessel_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' WHERE ind_jobs.ind_status = "Pending"' +
        ' ORDER BY ind_jobs.ind_group_id DESC;'


    connection.query(sql, function (error, data) {
        if (error) throw error;

        var dataset = [];
        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                if (j == 13) {

                    dataset[i].push("<p style='color: #FFA500'>" + values[j] + "</p>")

                } else if (j == 16) {

                    dataset[i].push(self.Helpers.formatFloatValue(String(values[j])))

                } else {

                    dataset[i].push(values[j])
                }


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
                {"title": "USER", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "CARRIER", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false, className: "danger-header"},
                {"title": "TO", "orderable": false, className: "danger-header"},
                {"title": "SCHEDULE", "orderable": false, className: "danger-header"},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "DEADLINE", "orderable": false},
                {"title": "CUT-OFF DATE", "orderable": false},
                {"title": "STATUS", "orderable": false},
                {"title": "FORWADER", "orderable": false},
                {"title": "Type", "visible": false, "orderable": false},
                {"title": "ESTIMATE COST €", "orderable": false},
                {"title": "NOTES", "orderable": false},
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
                    "title": "Group cut-off-date",
                    "visible": false
                },

                {
                    "title": "Group forwarder",
                    "visible": false
                },
                {
                    "title": "Sum estimate cost",
                    "visible": false
                },

                {
                    "title": "ACTIONS",
                    "orderable": false,
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-check confirm-job action-btn' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "rowCallback": function (row, data, index) {

                if (data[20] != "empty") {

                    $('td', row).css('background-color', data[20]);
                }
            },
            "order": [[19, 'desc'], [18, 'asc']],
            "pageLength": 25

        });


        $('#jobs_table').on('click', 'i.job-edit', function () {

            var data = jobs_table.row($(this).closest('tr')).data();
            self.Helpers.initliazeModalToEditJob(self.divisions, self.ports, self.products, self.vessels, self.cities, data);

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            $('#save-job-btn').unbind('click')
            $('#save-job-btn').on('click', function () {


                $(this).attr('disabled', 'disabled')
                var modeSelectValue = $('#mode-select').val()
                var divisionSelectValue = $('#division-select').val()
                var productSelectValue = $('#product-select').val()
                var vesselSelectValue = $('#vessel-select').val()
                var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
                var scheldureSelectValue = $('#scheldure_select').val()
                var forwarder = $('#forwarder').val()


                if (modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && estimatecostSelectValue != '' && scheldureSelectValue != '' && forwarder != '') {

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
                        var jobObject = {
                            ind_id: data[0],
                            ind_user_id: self.Helpers.user_id,
                            ind_division_id: $('#division-select').val(),
                            ind_product_id: $('#product-select').val(),
                            ind_mode: $('#mode-select').val(),
                            ind_vessel_id: $('#vessel-select').val(),
                            ind_ex: ind_ex,
                            ind_to: ind_to,
                            ind_timescheldure: $('#scheldure_select').val(),
                            ind_deadline: self.Helpers.changeDateToMysql($('#deadline_date').val()),
                            ind_cut_off_date: self.Helpers.changeDateToMysql($('#cutoff_date').val()),
                            ind_forwarder: $('#forwarder').val(),
                            ind_notes: $('#notes').val(),
                            ind_estimate_cost: $('#estimate_cost').val(),
                            ind_carrier: $('#carrier').val(),
                            ind_group_id: 0,
                            old_group_id: data[18]


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

            if (data[19] == 0) {

                swal({
                    title: "Are you sure?",
                    text: "If you confirm the job you will be unable to edit it!",
                    type: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#dc3545",
                    confirmButtonText: "Confirm",
                    closeOnConfirm: true

                }, function () {

                    self.confirmIndividualGroup(data[18]);

                })

            } else {


                if (data[21] == "" || data[21] == 0 || data[22] == "" || data[21] === null || data[23] == '' || data[23] === null) {

                    swal({
                        title: "Unable to confirm this group.",
                        text: "Some group data are empty. Please fill the missing data and try again. ",
                        type: "error",
                        showCancelButton: true,
                        showConfirmButton: false


                    })


                } else {

                    swal({
                        title: "Are you sure?",
                        text: "If you confirm this group you will not be able to edit it!",
                        type: "warning",
                        showCancelButton: true,
                        cancelButtonText: "Cancel",
                        confirmButtonColor: "#dc3545",
                        confirmButtonText: "Confirm",
                        closeOnConfirm: true

                    }, function () {

                        self.confirmIndividualGroup(data[18]);

                    })
                }


            }

        })


        $('#jobs_table').on('click', 'i.costs-job', function () {

            var data = jobs_table.row($(this).closest('tr')).data();
            $('#cost-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            $('#job_estimate_costs').val(data[16])

            if (data[19] == 0) {

                $('#group-cost-div').hide();
                $('#save-costs').hide()

            } else {

                if (data[23] == null || data[22] == null || data[21] == null)
                {

                    $('#saving-data').hide();
                } else {
                    $('#saving-data').show();

                }

                $('#group_cut_off_date').val(data[22])
                var sum_estimate_cost = data[24]
                var group_cost = data[21]

                var savings_percent = ((1 - (group_cost / sum_estimate_cost)) * 100).toFixed(2)

                var savings_amount = (data[16] * savings_percent / 100).toFixed(2)
                var shared_cost = ((group_cost / sum_estimate_cost) * data[16]).toFixed(2)


                $('#group_cost').val(self.Helpers.formatFloatValue(String(group_cost)))
                $('#group_id').val(data[18])
                $('#saving_amount').val(savings_amount)
                $('#saving_percent').val(savings_percent)
                $('#shared_cost').val(shared_cost)
                $('#group_forwarder').val(data[23])

                $('#group-cost-div').show();
                $('#save-costs').show()
            }

            $('#costs-modal').modal('show');
        })


        $("#search_datatable").keyup(function () {
            jobs_table.search($(this).val()).draw();
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
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT ' +
        ' ind_jobs.ind_id,' +
        ' users.user_username,' +
        ' ind_jobs.ind_is_grouped,' +
        ' ind_jobs.ind_group_id,' +
        ' divisions.division_description,' +
        ' products.product_description,' +
        ' ind_jobs.ind_mode,' +
        ' ind_jobs.ind_carrier,' +
        ' vessels.vessel_description,' +
        ' ind_jobs.ind_ex as ex_port, ' +
        ' ind_jobs.ind_to as to_port,' +
        ' ind_jobs.ind_scheldure,' +
        ' ind_jobs.ind_request_date,' +
        ' DATE_FORMAT(ind_jobs.ind_request_date, "%d/%m/%Y %H:%i:%s") as ind_request_date,' +
        ' DATE_FORMAT(ind_jobs.ind_deadline, "%d/%m/%Y") as ind_deadline,' +
        ' DATE_FORMAT(ind_jobs.ind_cut_off_date, "%d/%m/%Y") as ind_cut_off_date,' +
        ' DATE_FORMAT(individual_groups.ind_group_cut_off_date, "%d/%m/%Y") as ind_group_cut_off_date,' +
        ' DATE_FORMAT(ind_jobs.ind_confirmation_date, "%d/%m/%Y") as ind_confirmation_date,' +
        ' ind_jobs.ind_status,' +
        ' ind_jobs.ind_forwarder,' +
        ' ind_jobs.ind_estimate_cost,' +
        ' ind_jobs.ind_notes,' +
        ' individual_groups.ind_group_cost,' +
        ' (SELECT sum(individuals.ind_estimate_cost) FROM individuals WHERE ind_group_id = ind_jobs.ind_group_id) as sum_estimated_cost,' +
        ' individual_groups.ind_group_forwarder' +
        ' FROM individuals ind_jobs' +
        ' LEFT JOIN divisions on division_id = ind_jobs.ind_division_id' +
        ' LEFT JOIN users on user_id = ind_jobs.ind_user_id' +
        ' LEFT JOIN products on product_id = ind_jobs.ind_product_id' +
        ' LEFT JOIN vessels on vessel_id = ind_jobs.ind_vessel_id' +
        ' LEFT JOIN individual_groups on individual_groups.ind_group_id = ind_jobs.ind_group_id' +
        ' WHERE ind_jobs.ind_status = "Done";'

    connection.query(sql, function (error, data) {
        if (error) throw error;
        var dataset = [];

        for (i = 0; i < data.length; i++) {
            let values = Object.values(data[i])
            dataset[i] = [];
            for (j = 0; j < values.length; j++) {

                if (j == 17) {

                    dataset[i].push("<p style='color: #056608'>" + values[j] + "</p>")
                } else {
                    if (j == 2) {

                        if (values[j] == 0) {

                            dataset[i].push('Individual')
                        } else {

                            dataset[i].push('Group')
                        }

                    } else if (j == 19) {

                        dataset[i].push(self.Helpers.formatFloatValue(String(values[j])))
                    } else {
                        dataset[i].push(values[j])
                    }

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
                {"title": "USER", "orderable": false},
                {"title": "TYPE", "orderable": false},
                {"title": "GROUP", "orderable": false},
                {"title": "DEPARTMENT", "orderable": false},
                {"title": "PRODUCT", "orderable": false},
                {"title": "MODE", "orderable": false},
                {"title": "CARRIER", "orderable": false},
                {"title": "VESSEL", "orderable": false},
                {"title": "EX", "orderable": false,className: "danger-header"},
                {"title": "TO", "orderable": false,className: "danger-header"},
                {"title": "SCHEDULE", "orderable": false,className: "danger-header"},
                {"title": "REQ. DATE", "orderable": false},
                {"title": "DEADLINE", "orderable": false},
                {"title": "CUT-OFF DATE", "orderable": false},
                {"title": "GROUP CUT-OFF DATE", "orderable": false},
                {"title": "CONFIRMATION DATE", "orderable": false},
                {"title": "STATUS", "orderable": false},
                {"title": "FORWARDER", "orderable": false},
                {"title": "ESTIMATE COST", "orderable": false},
                {"title": "NOTES", "orderable": false},
                {"title": "Group Cost", "visible": false},
                {"title": "Sum estimate cost", "visible": false},
                {"title": "Group Forwarder", "visible": false},
                {
                    "title": "ACTIONS", "orderable": false,
                    "defaultContent": "<i class='fa fa-search job-edit action-btn' style='cursor: pointer'></i><i class='fa fa-dollar done-job-cost action-btn' style='cursor: pointer' ></i>"
                }

            ],
            "order": [[3, 'desc']],
            "pageLength": 25
        });


        $('#done_individuals_table').on('click', 'i.job-edit', function () {

            $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = jobs_table.row($(this).parents('tr')).data();

            $('#done_ind_id').val(data[0])
            $('#notes').val(data[20])
            $('#notes-modal').modal('show')


        })

        $('#done_individuals_table').on('click', 'i.done-job-cost', function () {

            $('#cost-data-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
            var data = jobs_table.row($(this).closest('tr')).data();

            $('#job_estimate_costs').val(data[19])

            if (data[2] == 'Individual') {

                $('#group-cost-div').hide();

            } else {

                var sum_estimate_cost = data[22]
                var group_cost = data[21]

                var savings_percent = ((1 - (group_cost / sum_estimate_cost)) * 100).toFixed(2)

                var savings_amount = (data[19] * savings_percent / 100).toFixed(2)
                var shared_cost = ((group_cost / sum_estimate_cost) * data[19]).toFixed(2)

                $('#group_cost').val(self.Helpers.formatFloatValue(String(group_cost)))
                $('#group_id').val(data[3])
                $('#saving_amount').val(savings_amount)
                $('#saving_percent').val(savings_percent)
                $('#shared_cost').val(shared_cost)
                $('#group_forwarder').val(data[23])
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

DbClass.prototype.getAllDoneConsolidations = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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
                        closeOnConfirm: true

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
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM vessels'

    connection.query(sql, function (error, vessels) {
        if (error) throw error;


        self.vessels = vessels;

    });

    connection.end();


}

DbClass.prototype.getAllPorts = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM ports order by port_name'

    connection.query(sql, function (error, ports) {
        if (error) throw error;


        self.ports = ports;
        $('#ex-select-port').empty();
        $('#to-select-port').empty();
        $('#ex-select-port').append("<option></option>")
        $('#to-select-port').append("<option></option>")
        for (i = 0; i < ports.length; i++) {

            $('#ex-select-port').append(new Option(ports[i].port_name, ports[i].port_name))
            $('#to-select-port').append(new Option(ports[i].port_name, ports[i].port_name))


        }
        $('#ex-select-port').trigger("chosen:updated")
        $('#to-select-port').trigger("chosen:updated")

    });

    connection.end();


}

DbClass.prototype.getAllColors = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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

DbClass.prototype.getAllAirports = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true
    });

    connection.connect();

    var sql = 'SELECT * FROM airports order by airport_name'

    connection.query(sql, function (error, airports) {
        if (error) throw error;


        self.airports = airports;
        $('#ex-select-airport').empty();
        $('#to-select-airport').empty();
        $('#ex-select-airport').append("<option></option>")
        $('#to-select-airport').append("<option></option>")
        for (i = 0; i < airports.length; i++) {

            $('#ex-select-airport').append(new Option(airports[i].airport_name, airports[i].airport_name))
            $('#to-select-airport').append(new Option(airports[i].airport_name, airports[i].airport_name))


        }
        $('#ex-select-airport').trigger("chosen:updated")
        $('#to-select-airport').trigger("chosen:updated")


    });

    connection.end();


}

DbClass.prototype.getAllCities = function () {

    let self = this;

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        'ind_product_id, ' +
        'ind_mode, ' +
        'ind_vessel_id, ' +
        'ind_ex, ' +
        'ind_to, ' +
        'ind_scheldure, ' +
        'ind_request_date, ' +
        'ind_deadline, ' +
        'ind_cut_off_date, ' +
        'ind_forwarder, ' +
        'ind_status, ' +
        'ind_estimate_cost, ' +
        'ind_carrier, ' +
        'ind_notes) VALUES (' +
        indiavidualObject.ind_user_id + ', ' +
        indiavidualObject.ind_division_id + ', ' +
        indiavidualObject.ind_product_id + ', "' +
        indiavidualObject.ind_mode + '", ' +
        indiavidualObject.ind_vessel_id + ', "' +
        indiavidualObject.ind_ex + '", "' +
        indiavidualObject.ind_to + '", "' +
        indiavidualObject.ind_timescheldure + '", '
        + '"' + indiavidualObject.ind_request_date + '", '
        + '"' + indiavidualObject.ind_deadline + '", '
        + '"' + indiavidualObject.ind_cut_off_date + '", "' +
        indiavidualObject.ind_forwarder + '", "' +
        "Pending" + '", ' +
        indiavidualObject.ind_estimate_cost + ', "' +
        indiavidualObject.ind_carrier + '", "' +
        indiavidualObject.ind_notes + '")'


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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
        'ind_product_id = ' + jobObject.ind_product_id + ', ' +
        'ind_mode = "' + jobObject.ind_mode + '", ' +
        'ind_vessel_id = ' + jobObject.ind_vessel_id + ', ' +
        'ind_ex = "' + jobObject.ind_ex + '", ' +
        'ind_to = "' + jobObject.ind_to + '", ' +
        'ind_scheldure = "' + jobObject.ind_timescheldure + '", ' +
        'ind_deadline = "' + jobObject.ind_deadline + '", ' +
        'ind_cut_off_date = "' + jobObject.ind_cut_off_date + '", ' +
        'ind_forwarder = "' + jobObject.ind_forwarder + '", ' +
        'ind_estimate_cost = ' + jobObject.ind_estimate_cost + ', ' +
        'ind_notes = "' + jobObject.ind_notes + '",' +
        'ind_group_id = 0,' +
        'ind_carrier = "' + jobObject.ind_carrier + '"' +
        ' WHERE ind_id = ' + jobObject.ind_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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
        ' WHERE ind_group_id = ' + groupID + '; UPDATE individual_groups SET ind_group_active = 0, ind_group_confirmation_date = "' + self.Helpers.getDateTimeNow() + '" WHERE ind_group_id = ' + groupID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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

DbClass.prototype.saveConsolidationNotes = function (jobID, noteText) {

    let self = this;

    var sql = 'UPDATE consolidations SET ' +
        'con_notes = "' + noteText + '" ' +
        ' WHERE con_id = ' + jobID;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
        'ind_group_scheldure = "' + individualData.ind_timescheldure + '" AND ' +
        'ind_group_active = 1';

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_scheldure, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex + '", "' +
                    individualData.ind_to + '", "' +
                    individualData.ind_timescheldure + '", 1)';


                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: '1q2w3e4r',
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
                            password: '1q2w3e4r',
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

                    var randomNumber = Math.floor(Math.random() * 29) + 1;

                    var updateGroups = 'UPDATE individual_groups SET ind_group_color = "' + self.colors[randomNumber].color_code + '" WHERE ind_group_id = ' + groupResults[0].ind_group_id;

                    var updateConnections = mysql.createConnection({
                        host: self.serverIP,
                        user: self.user,
                        password: '1q2w3e4r',
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
                                password: '1q2w3e4r',
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
                        password: '1q2w3e4r',
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
        'ind_group_scheldure = "' + individualData.ind_timescheldure + '" AND ' +
        'ind_group_active = 1';

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
                    '(ind_group_color, ind_group_ex, ind_group_to, ind_group_scheldure, ind_group_active) VALUES ' +
                    '("empty","' +
                    individualData.ind_ex + '", "' +
                    individualData.ind_to + '", "' +
                    individualData.ind_timescheldure + '", 1)';


                var insertConnection = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: '1q2w3e4r',
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
                            password: '1q2w3e4r',
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
                            password: '1q2w3e4r',
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
                                    password: '1q2w3e4r',
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
                            password: '1q2w3e4r',
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
                        password: '1q2w3e4r',
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
        'WHERE ind_is_grouped = 1 AND ind_status = "Pending"' +
        'group by ind_group_id;'

    var newConnection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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

                var ungroup_sql = 'UPDATE individuals set ind_is_grouped = 0 WHERE ind_group_id = ' + individuals[i].ind_group_id + '; ' +
                    'UPDATE individual_groups SET ind_group_color = "empty" WHERE ind_group_id = ' + individuals[i].ind_group_id + ';'

                var ungrouConn = mysql.createConnection({
                    host: self.serverIP,
                    user: self.user,
                    password: '1q2w3e4r',
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
                    self.getAllIndividuals();


                });

                ungrouConn.end();


            }


        }
        $('#jobs_table').unbind('click')
        $('#jobs_table').DataTable().clear();
        $('#jobs_table').DataTable().destroy();
        self.getAllIndividuals();


    });

    newConnection.end();


}

DbClass.prototype.updateGroupCost = function (groupCostData) {

    let self = this;

    var sql = 'UPDATE individual_groups SET ' +
        'ind_group_cost = ' + groupCostData.ind_group_cost + ', ind_group_cut_off_date = "' + groupCostData.ind_group_cut_off_date + '"' + ', ind_group_forwarder = "' + groupCostData.ind_group_forwarder + '" ' +
        ' WHERE ind_group_id = ' + groupCostData.ind_group_id;


    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
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
            $('#costs-modal').modal('hide')
            $('#jobs_table').unbind('click')
            $('#jobs_table').DataTable().clear();
            $('#jobs_table').DataTable().destroy();
            self.getAllIndividuals();
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
        password: '1q2w3e4r',
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
                    password: '1q2w3e4r',
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
                            password: '1q2w3e4r',
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
                    password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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
        password: '1q2w3e4r',
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

DbClass.prototype.addAirport = function (airportName) {

    let self = this;

    var sql = 'INSERT INTO airports (airport_name) VALUES ("' + airportName + '");'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to add airport.')
            throw error

        } else {

            self.Helpers.toastr('success', 'Airport added successfully.')
            $('#data-type-select').val('').trigger("chosen:updated");
            $('#data-value').val('')
            $('#add-new-data').attr('disabled', null)
        }

    });

    connection.end()

}

DbClass.prototype.addPort = function (portName) {

    let self = this;

    var sql = 'INSERT INTO ports (port_name) VALUES ("' + portName + '");'

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: self.serverIP,
        user: self.user,
        password: '1q2w3e4r',
        database: self.database,
        port: self.port,
        dateStrings: true,
        multipleStatements: true
    });

    connection.connect();

    connection.query(sql, function (error) {
        if (error) {

            alert('Unable to add port.')
            throw error

        } else {

            self.Helpers.toastr('success', 'Port added successfully.')
            $('#data-type-select').val('').trigger("chosen:updated");
            $('#data-value').val('')
            $('#add-new-data').attr('disabled', null)
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
        password: '1q2w3e4r',
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
            $('#data-type-select').val('').trigger("chosen:updated");
            $('#data-value').val('')
            $('#add-new-data').attr('disabled', null)
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
        password: '1q2w3e4r',
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
            $('#data-type-select').val('').trigger("chosen:updated");
            $('#data-value').val('')
            $('#add-new-data').attr('disabled', null)
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
        password: '1q2w3e4r',
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



