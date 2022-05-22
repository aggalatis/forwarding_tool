let DoneIndividualsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.DB.getAllProducts()
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.bindMovingEvents('help-modal-header')
    this.Helpers.initializeUser()
    this.Helpers.initCurrencyInfo()
    this.Helpers.bindCloseBtnsAlerts()
    this.Helpers.bindMovingEvents('edit-notes-modal-header')
    this.Helpers.bindMovingEvents('cost-data-modal-header')
    this.Helpers.bindMovingEvents('done-personnel-modal-header')
    this.Helpers.bindMovingEvents('assignment-modal-header')
    this.Helpers.bindMovingEvents('edit-done-job-modal-header')
    this.bindEventsOnButtons()
    this.selectedJobs = []
    this.selectedDoneInd = []
    this.selectedDoneDestination = []
    let self = this
    setTimeout(function () {
        self.initializetable()
    }, 500)
}

DoneIndividualsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    self.DB.getAllColors()
    $('#product-select').chosen()
    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#save-notes').on('click', function () {
        var jobID = $('#done_ind_id').val()
        var notesText = $('#notes').val()
        self.DB.saveNotesChanges(jobID, notesText)
        self.refreshTable()
    })

    $('#assign-btn').on('click', () => {
        if (self.selectedDoneInd.length == 0) {
            Swal.fire({
                title: 'Select jobs for assignment',
                text: 'Unfortunately you need to select some jobs before you can assign them to consolidation.',
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        if (!self.Helpers.jobsHaveSameDestination(self.selectedDoneDestination)) {
            Swal.fire({
                title: 'Job destination mismatch',
                text: `Unfortunately all jobs selected don't have the same destination.`,
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        self.appendConsolidationGroups(self.selectedDoneDestination[0])
        $('#assignment-group-modal').modal('show')
    })

    $('#assign-jobs').on('click', () => {
        let selGroup = $('input.con-group:checked').val()
        if (typeof selGroup === 'undefined') {
            self.Helpers.toastr('warning', 'Please select a group first.')
            return
        }
        if (selGroup == 0) {
            self.DB.assignJobsToNewGroup(self.selectedDoneInd)
        } else {
            self.DB.assignJobsToConGroup(selGroup, self.selectedDoneInd)
        }
    })

    $('#save-done-job-btn').on('click', async function () {
        let indJobData = {
            id: $('#done-ind-id').val(),
            pieces: $('#pieces').val(),
            reference: $('#reference').val(),
            kg: $('#kg').val(),
            products: $('#product-select').val(),
        }
        if (
            indJobData.pieces == '' ||
            indJobData.pieces == null ||
            indJobData.reference == '' ||
            indJobData.reference == null ||
            indJobData.kg == '' ||
            indJobData.kg == null ||
            indJobData.products.length == 0
        ) {
            self.Helpers.toastr('error', 'Some required fields are empty.')
            return
        }
        indJobData.products = self.Helpers.changeProductIdstoString($('#product-select').val(), self.DB)
        await self.DB.updateIndDoneJob(indJobData)
        $('#edit-done-job-modal').modal('hide')
        self.refreshTable()
    })
}

DoneIndividualsClass.prototype.initializetable = async function () {
    let self = this

    let indData = await self.DB.getAllDoneIndividuals(self.Helpers)
    let dataset = self.formatData(indData)
    let jobs_table = $('#done_individuals_table').DataTable({
        data: dataset,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            {
                title: 'JOB ID',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.ind_parent != 0) $(td).html(`${rowData.ind_subid}`)
                },
                data: 'ind_id',
            },
            { title: 'REQ. DATE', orderable: false, data: 'ind_request_date' },
            { title: 'USER', orderable: false, data: 'user_username' },
            {
                title: 'GROUP ID',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('background-color', rowData.ind_group_color)
                },
                data: 'ind_group_id',
            },
            {
                title: 'TYPE',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.ind_type == self.Helpers.GROUPED_TEXT) $(td).css('color', self.Helpers.GROUPED_COLOR)
                    if (rowData.ind_type == self.Helpers.INDIVIDUAL_TEXT) $(td).css('color', self.Helpers.INDIVIDUAL_COLOR)
                    if (rowData.ind_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) $(td).css('color', self.Helpers.LOCAL_SERVICE_COLOR)
                    if (rowData.ind_type == self.Helpers.PERSONNEL_TEXT) $(td).css('color', self.Helpers.PERSONNEL_COLOR)
                    $(td).css('font-weight', 'bold')
                },
                data: 'ind_type',
            },
            { title: 'DEPARTMENT', orderable: false, data: 'division_description' },
            { title: 'PRODUCT', orderable: false, data: 'ind_products' },
            {
                title: 'MODE',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.ind_mode == self.Helpers.PERSONNEL_TEXT) $(td).css('color', self.Helpers.PERSONNEL_COLOR)
                    $(td).css('font-weight', 'bold')
                },
                data: 'ind_mode',
            },
            { title: 'SERVICE', orderable: false, data: 'service_type_description' },
            { title: 'VESSEL', orderable: false, data: 'ind_vessels' },
            { title: 'EX', orderable: false, className: 'danger-header', data: 'ex_city' },
            { title: 'TO', orderable: false, className: 'danger-header', data: 'to_city' },
            { title: 'DEADLINE', orderable: false, className: 'danger-header', data: 'ind_deadline' },
            { title: 'CONFIRMATION DATE', orderable: false, data: 'ind_confirmation_date' },
            { title: 'FORWARDER', orderable: false, data: 'ind_forwarder' },
            { title: 'REFERENCE', orderable: false, data: 'ind_reference' },
            { title: 'PIECES', orderable: false, data: 'ind_pieces' },
            { title: 'KG', orderable: false, data: 'ind_kg' },
            { title: 'ESTIMATE COST (€)', orderable: false, data: 'ind_estimate_cost' },
            { title: 'NOTES', visible: false, data: 'ind_notes' },
            { title: 'Group Color', visible: false, data: 'ind_group_color' },
            { title: 'Group Cost', visible: false, data: 'ind_group_cost' },
            { title: 'GROUP DEADLINE', orderable: false, data: 'ind_group_deadline' },
            { title: 'GROUP FORWARDER', orderable: false, data: 'ind_group_forwarder' },
            { title: 'Sum estimate cost', visible: false, data: 'sum_estimated_cost' },
            { title: 'Actual cost', visible: false, data: 'ind_actual_cost' },
            {
                title: 'CONSOLIDATED',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.ind_consolidated == 0) $(td).html('NO').css('color', 'red').css('font-weight', 'bold')
                    if (rowData.ind_consolidated == 1) $(td).html('YES').css('color', 'green').css('font-weight', 'bold')
                },
                data: 'ind_consolidated',
            },
            { title: 'Timestamp', visible: false, data: 'ind_timestamp' },
            { title: 'Splitted', visible: false, data: 'ind_splitted' },
            { title: 'Parent', visible: false, data: 'ind_parent' },
            { title: 'Is grouped', visible: false, data: 'ind_is_grouped' },
            { title: 'Subid', visible: false, data: 'ind_subid' },
            {
                title: 'ACTIONS',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).children('.split-job').hide()
                    if (self.Helpers.jobHasMultiVessels(rowData)) {
                        $(td).children('.select-done-jobs').hide()
                        if (rowData.ind_splitted == 0) $(td).children('.split-job').show()
                    }
                    if (rowData.ind_consolidated == 1) $(td).children('.select-done-jobs').hide()
                    if (rowData.ind_type == self.Helpers.PERSONNEL_TEXT) $(td).children('.select-done-jobs').hide()
                    if (rowData.ind_parent != 0) {
                        $(td).children('.done-job-cost').hide()
                        if (
                            rowData.ind_pieces == '' ||
                            rowData.ind_pieces == null ||
                            rowData.ind_kg == '' ||
                            rowData.ind_kg == null ||
                            rowData.ind_reference == '' ||
                            rowData.ind_reference == null ||
                            rowData.ind_pieces == '' ||
                            rowData.ind_pieces == null
                        )
                            $(td).children('.select-done-jobs').hide()
                    }
                },
                defaultContent:
                    "<i class='fa fa-search job-edit action-btn' style='cursor: pointer' title='modify'></i> \
                    <i class='fa fa-dollar done-job-cost action-btn' style='cursor: pointer' title='costs'></i> \
                    <i class='fa fa-sitemap split-job action-btn' style='cursor: pointer' title='dissolve'></i> \
                    <i class='select-done-jobs' style='cursor: pointer' title='select'><img src='../assets/icons/consolidations.png'/ style='width: 15px'></i> ",
            },
        ],
        createdRow: function (row, data, index, cells) {
            if (data.ind_parent != 0 || data.ind_splitted != 0) {
                $('td:eq(0)', row).css('border-left', `4px solid ${data.ind_split_color}`)
            }
            if (data.ind_parent != 0) $('td', row).css('font-style', 'italic')
        },
        order: [
            [30, 'desc'],
            [4, 'asc'],
            [3, 'desc'],
            [28, 'desc'],
            [31, 'asc'],
        ],
        pageLength: 25,
    })

    self.Helpers.applyMouseInteractions('done_individuals_table')

    $('#done_individuals_table').on('click', 'i.select-done-jobs', function () {
        var data = jobs_table.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        if (self.selectedDoneInd.indexOf(data.ind_id) == -1) {
            $(this).parents('tr').addClass('datatableBack')
            self.selectedDoneInd.push(data.ind_id)
            self.selectedDoneDestination.push(data.to_city)
        } else {
            $(this).parents('tr').removeClass('datatableBack')
            self.selectedDoneInd.splice(self.selectedDoneInd.indexOf(data.ind_id), 1)
            self.selectedDoneDestination.splice(self.selectedDoneDestination.indexOf(data.to_city), 1)
        }
    })

    $('#done_individuals_table').on('click', 'i.split-job', function () {
        var data = jobs_table.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        Swal.fire({
            title: 'Dissolve Job?',
            text: `Are you sure you want to split job per vessel?`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(async function (result) {
            if (result.isConfirmed) {
                await self.DB.splitJob(data)
                self.refreshTable()
            }
        })
    })

    $('#done_individuals_table').on('click', 'i.job-edit', function () {
        $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        var data = jobs_table.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        if (data.ind_parent == 0) {
            $('#done_ind_id').val(data.ind_id)
            $('#notes').val(data.ind_notes)
            $('#notes-modal').modal('show')
        } else {
            self.initializeProductsSelect(data.ind_division_id)
            $('#done-ind-id').val(data.ind_id)
            $('#reference').val(data.ind_reference)
            $('#pieces').val(data.ind_pieces)
            $('#kg').val(data.ind_kg)
            $('#notes').val(data.ind_notes)
            self.Helpers.findChoosenValueForProducts(self.DB.products, data.ind_products)
            $('#edit-done-job-modal').modal('show')
        }
    })

    $('#done_individuals_table').on('click', 'i.done-job-cost', function () {
        $('#cost-data-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        $('#done-personnel-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        var data = jobs_table.row($(this).closest('tr')).data()

        $('#job_estimate_costs').val(data.ind_estimate_cost)
        $('#department').val(data.division_description)

        if (data.ind_type != self.Helpers.GROUPED_TEXT) {
            if (data.ind_type == self.Helpers.PERSONNEL_TEXT) {
                $('#personnel-estimate-cost').val(data.ind_estimate_cost)
                $('#personnel-actual-cost').val(data.ind_actual_cost)
                var savings = data.ind_estimate_cost - data.ind_actual_cost
                $('#personnel-savings').val(savings)
                $('#personnel-savings-percent').val((savings / data.ind_estimate_cost) * 100)
                $('#done-personnel-costs-modal').modal('show')
            } else {
                $('#group-cost-div').hide()
                $('#done-costs-modal').modal('show')
            }
        } else {
            var sum_estimate_cost = data.sum_estimated_cost
            var group_cost = data.ind_group_cost

            var savings_percent = ((1 - group_cost / sum_estimate_cost) * 100).toFixed(2)

            var savings_amount = ((data.ind_estimate_cost * savings_percent) / 100).toFixed(2)
            var shared_cost = ((group_cost / data.sum_estimated_cost) * data.ind_estimate_cost).toFixed(2)

            $('#group_cost').val(self.Helpers.formatFloatValue(String(group_cost)))
            $('#group_id').val(data.ind_group_id)
            $('#saving_amount').val(savings_amount)
            $('#saving_percent').val(savings_percent)
            $('#shared_cost').val(shared_cost)
            $('#group_forwarder').val(data.ind_group_forwarder)
            $('#group-cost-div').show()
            $('#save-costs').show()
            $('#done-costs-modal').modal('show')
        }
    })

    $('#search_datatable').keyup(function () {
        if ($(this).val() != '') {
            let regexp = `\\b${$(this).val()}`
            jobs_table.search(regexp, true, false).draw()
        } else {
            jobs_table.search('').draw()
        }
    })
}

DoneIndividualsClass.prototype.appendConsolidationGroups = async function (to_name) {
    let self = this
    $('#con-group-radios').html('')
    $('#con-group-radios').append(`<label class="custom-control custom-radio dark">
        <input name="radio-stacked" class="custom-control-input con-group" type="radio" value="0" />
        <span class="custom-control-indicator"></span>
        <span class="custom-control-description">NEW CONSOLIDATION</span>
    </label>`)
    let conGroups = await self.DB.getConGroups()
    for (let conGroup of conGroups) {
        console.log()
        if (conGroup.city_name == to_name)
            $('#con-group-radios').append(`<label class="custom-control custom-radio dark">
                <input name="radio-stacked" class="custom-control-input con-group" type="radio" value="${conGroup.con_group_id}" />
                <span class="custom-control-indicator"></span>
                <span class="custom-control-description" style="background-color: ${conGroup.con_group_color}">CONSOLIDATION ID: ${conGroup.con_group_id} VESSEL: ${conGroup.vessel}</span>
                </label>`)
    }
}

DoneIndividualsClass.prototype.formatData = function (data) {
    let self = this
    let dataset = []
    for (let job of data) {
        if (job.ind_is_grouped == 1) job.ind_type = self.Helpers.GROUPED_TEXT
        if (job.ind_is_grouped == 0) job.ind_type = self.Helpers.INDIVIDUAL_TEXT
        if (job.service_type_description == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) job.ind_type = self.Helpers.LOCAL_SERVICE_TYPE_TEXT
        if (job.ind_mode == self.Helpers.PERSONNEL_TEXT) job.ind_type = self.Helpers.PERSONNEL_TEXT
        dataset.push(job)
    }
    return dataset
}

DoneIndividualsClass.prototype.refreshTable = function () {
    let self = this
    $('#done_individuals_table').unbind('click')
    $('#done_individuals_table').DataTable().clear()
    $('#done_individuals_table').DataTable().destroy()
    setTimeout(function () {
        self.initializetable()
    }, 2000)
}

DoneIndividualsClass.prototype.initializeProductsSelect = function (divisionID) {
    let self = this
    $('#product-select').empty()
    $('#product-select').append('<option></option>')
    for (i = 0; i < self.DB.products.length; i++) {
        if (divisionID == self.DB.products[i].product_division_id) {
            $('#product-select').append(new Option(self.DB.products[i].product_description, self.DB.products[i].product_id))
        }
        $('#product-select').attr('disabled', false).trigger('chosen:updated')
    }
}
