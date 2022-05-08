let DoneConsolidationsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initInstructionFiles(this.DB)
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.bindMovingEvents('help-modal-header')
    this.Helpers.bindMovingEvents('cost-done-cons-head')
    this.Helpers.bindMovingEvents('edit-notes-consolidation-head')
    this.Helpers.bindMovingEvents('delivery-on-board-modal-header')
    this.Helpers.initializeUser()
    this.Helpers.initCurrencyInfo()
    this.bindEventsOnButtons()
    this.selectedDoneInds = []
    this.selectedDoneDestination = []
    this.selectedDoneGroupId = -1
    this.DB.getAllCities()
    this.DB.getAllServiceTypes()
    let self = this
    setTimeout(function () {
        self.initializetable()
        self.initialiazeCitiesSelect()
        self.initializeServiceTypeSelect()
    }, 500)
}

DoneConsolidationsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#group-mode-select').chosen()
    $('#group-ex-select').chosen()
    $('#group-to-select').chosen()
    $('#service-type-select').chosen()

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#save-consol-notes').on('click', async function () {
        var jobID = $('#done_consolidation_id').val()
        var notesText = $('#notes').val()
        try {
            await self.DB.saveConsolidationNotes(jobID, notesText)
            self.Helpers.toastr('success', 'Consolidaiton notes changes')
            $('#consol-notes-modal').modal('hide')
            $('#done_consolidations_table').unbind('click')
            $('#done_consolidations_table').DataTable().clear()
            $('#done_consolidations_table').DataTable().destroy()
            self.initializetable()
        } catch (err) {
            console.log(err)
        }
    })
    $('#assign-btn').on('click', () => {
        if (self.selectedDoneInds.length == 0) {
            Swal.fire({
                title: 'Select jobs for assignment',
                text: 'Unfortunately you need to select some jobs before you can assign them to consolidation.',
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        console.log(self.selectedDoneInds)
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
            self.DB.assignConJobsToNewGroup(self.selectedDoneInds)
        } else {
            self.DB.assignConJobsToConGroup(selGroup, self.selectedDoneInds)
        }
    })

    $('#save-delivery-on-board').on('click', async function () {
        $(this).attr('disabled', 'disabled')
        let dateSelected = $('#group-delivered-on-boat').val()
        let groupId = $('#done-con-group-id').val()
        if (dateSelected == '' || dateSelected == null) {
            self.Helpers.toastr('error', 'Some required fields are empty.')
            $(this).attr('disabled', false)
            return
        }
        let resp = await self.DB.updateGroupOnBoardDelivery(groupId, dateSelected)
        if (resp.affectedRows != 1) {
            $(this).attr('disabled', false)
            self.Helpers.toastr('error', 'Cannot update delivery on board')
            return
        }
        self.Helpers.toastr('success', 'Delivery date updated!')
        $(this).attr('disabled', false)
        $('#delivery-on-board-modal').modal('hide')
        self.refreshTable()
    })
}

DoneConsolidationsClass.prototype.initializetable = async function () {
    let self = this

    self.DB.getAllColors()
    let dnConsol = await self.DB.getAllDoneConsolidations()
    let tableData = self.formatData(dnConsol)
    let doneConsTable = $('#done_consolidations_table').DataTable({
        data: tableData,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: 'ID', orderable: false, data: 'cond_id', visible: false },
            { title: 'JOB ID', orderable: false, data: 'cond_ind_id' },
            {
                title: 'CONSOL. ID',
                orderable: false,
                data: 'group_id',
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css('background-color', rowData.con_group_color)
                },
            },
            { title: 'REQ. DATE', orderable: false, data: 'cond_request_date' },
            { title: 'USER', orderable: false, data: 'user_username' },
            { title: 'DEPARTMENT', orderable: false, data: 'division_description' },
            {
                title: 'TYPE',
                orderable: false,
                data: 'cond_type',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.cond_type == 'Individual') {
                        $(td).css('color', 'blue').css('font-weight', 'bold')
                    }
                    if (rowData.cond_type == 'Grouped') {
                        $(td).css('color', '#32CD32').css('font-weight', 'bold')
                    }
                    if (rowData.cond_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) {
                        $(td).css('color', 'red').css('font-weight', 'bold')
                    }
                },
            },
            { title: 'PRODUCTS', orderable: false, data: 'cond_products' },
            { title: 'MODE', orderable: false, data: 'con_group_mode' },
            { title: 'SERVICE', orderable: false, data: 'service_type_description' },
            { title: 'VESSELS', orderable: false, data: 'cond_vessels' },
            { title: 'EX', orderable: false, className: 'danger-header', data: 'ex_name' },
            { title: 'TO', orderable: false, className: 'danger-header', data: 'to_name' },
            { title: 'DEADLINE', orderable: false, className: 'danger-header', data: 'con_group_deadline' },
            { title: 'CONFIRMATION DATE	', orderable: false, data: 'con_group_confirmation_date' },
            { title: 'FORWARDER', orderable: false, data: 'con_group_forwarder' },
            { title: 'REFERENCE', orderable: false, data: 'cond_reference' },
            { title: 'CONSOL. COST (€)', orderable: false, data: 'con_group_cost' },
            { title: 'PIECES', orderable: false, data: 'cond_pieces' },
            { title: 'WEIGHT (KG)', orderable: false, data: 'cond_kg' },
            { title: 'COST / KG (€)', orderable: false, data: 'cond_cost_per_kg' },
            { title: 'SHARED CONS COST (€)', visible: true, data: 'cond_shared_cost' },
            {
                title: 'RE-CONSOLIDATED',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.cond_consolidated != 1) {
                        $(td).html('NO').css('color', 'red').css('font-weight', 'bold')
                    } else {
                        $(td).html('YES').css('color', 'green').css('font-weight', 'bold')
                    }
                },
                data: 'cond_consolidated',
            },
            {
                title: 'DELIVERED ON BOARD',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.cond_delivered_on_board == '' || rowData.cond_delivered_on_board == null) {
                        $(td).html('NO').css('color', 'red').css('font-weight', 'bold')
                    } else {
                        $(td).html(`YES`).css('color', 'green').css('font-weight', 'bold')
                    }
                },
                data: 'cond_delivered_on_board',
            },
            {
                title: 'ACTIONS',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.cond_status != 'Done') $(td).children('.select-done-jobs').hide()
                    if (rowData.cond_delivered_on_board != '' && rowData.cond_delivered_on_board != null) $(td).children('.select-done-jobs').hide()
                    if (rowData.cond_consolidated == 1) $(td).children('.select-done-jobs').hide()
                },
                defaultContent:
                    "<i class='fa fa-search job-edit action-btn' style='cursor: pointer' title='modify'></i> \
                    <i class='fa fa-dollar costs-job action-btn' title='costs' style='cursor: pointer' ></i> \
                    <i class='select-done-jobs' style='cursor: pointer' title='select'><img src='../assets/icons/consolidations.png'/ style='width: 15px'></i> \
                    <i class='fa fa-ship delivery-edit action-btn' style='cursor: pointer' title='delivery-on-board'></i> \
                    <i class='fa fa-flag flag-job action-btn' style='cursor: pointer' title='flag-job'></i>",
            },
        ],
        createdRow: function (row, data, index, cells) {
            if (data.cond_highlight == 1) {
                $('td', row).css('border-top', '2px solid red').css('border-bottom', '2px solid red')
                $('td:eq(0)', row).css('border-left', '2px solid red')
                $('td:eq(23)', row).css('border-right', '2px solid red')
            }
        },
        order: [[2, 'desc']],
        pageLength: 25,
    })
    $('#done_consolidations_table').on('click', 'i.select-done-jobs', function () {
        var data = doneConsTable.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            Swal.fire({
                title: 'Unable to select this job.',
                text: "Unfortunately this is a job inserted by different user. You can't select it.",
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        if (data.cond_consolidated != null && data.cond_consolidated != 0) {
            Swal.fire({
                title: 'Group Re Consolidated',
                text: 'Unfortunately this group is already consolidated.',
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }

        self.selectedDoneInds = []
        self.selectedDoneDestination = []

        if (self.selectedDoneGroupId != data.cond_group_id) {
            let selectedGroupJobs = tableData.filter(el => el.cond_group_id == data.cond_group_id && el.cond_consolidated == 0)
            for (let i = 0; i < selectedGroupJobs.length; i++) {
                self.selectedDoneInds.push(selectedGroupJobs[i].cond_id)
                self.selectedDoneDestination.push(selectedGroupJobs[i].to_name)
                self.selectedDoneGroupId = data.cond_group_id
            }
        } else {
            self.selectedDoneGroupId = -1
        }

        self.updateSelectedTableColors(doneConsTable)
    })
    $('#done_consolidations_table').on('click', 'i.job-edit', function () {
        $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        var data = doneConsTable.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        $('#done_consolidation_id').val(data.cond_id)
        $('#notes').val(data.cond_notes)
        $('#consol-notes-modal').modal('show')
    })
    $('#done_consolidations_table').on('click', 'i.delivery-edit', function () {
        const data = doneConsTable.row($(this).parents('tr')).data()
        if (data.cond_delivered_on_board == 1) {
            Swal.fire({
                title: 'Revert Delivery?',
                text: `Undo delivery on board for this job. Once you apply the job will be available for reconsolidation.`,
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Confirm',
            }).then(async function (result) {
                if (result.isConfirmed) {
                    await self.DB.revertOnBoardDelivery(data.cond_id)
                    self.refreshTable()
                }
            })
        } else {
            Swal.fire({
                title: 'Deliver group?',
                text: `Group delivered on board? Once you confirm delivery you wan't be able to revert it.`,
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Confirm',
            }).then(async function (result) {
                if (result.isConfirmed) {
                    await self.DB.updateGroupOnBoardDelivery(data.group_id)
                    self.refreshTable()
                }
            })
        }
    })
    $('#done_consolidations_table').on('click', 'i.costs-job', function () {
        $('#total-savings-div').hide()
        var data = doneConsTable.row($(this).closest('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        let groupJobs = []
        const tableData = doneConsTable.rows().data()
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].group_id == data.group_id) groupJobs.push(tableData[i])
        }
        let foundGroupedJobs = groupJobs.find(el => el.cond_type == 'Grouped')
        let foundIndividualJobs = groupJobs.find(el => el.cond_type == 'Individual')
        let foundLocalJobs = groupJobs.find(el => el.cond_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT)
        $('#group-savings').val('')
        $('#grouped-jobs-cost').hide()
        $('#individual-jobs-cost').hide()
        $('#local-jobs-costs').hide()
        $('#calculate-group-savings').hide()

        if (typeof foundLocalJobs != 'undefined') {
            $('#local-jobs-costs').show()
            $('#locals-cost').val(data.con_group_local_cost)
        }
        if (typeof foundGroupedJobs != 'undefined') {
            $('#grouped-jobs-cost').show()
            $('#calculate-group-savings').show()
            $('#append-grouped-estimate-cost').html('')
            $('#group-cost').val(data.con_group_cost)
            let divString = ''
            for (let job of groupJobs) {
                if (job.cond_type == 'Grouped') {
                    divString += `<div class="col-12"><div class="form-group"><label class="bold-label currency-label"> Job ${job.cond_ind_id} | Ref: ${job.cond_reference} (EUR)</label><input class="form-control currency-input grouped-estimate-cost-input" data-id="${job.cond_id}"  placeholder="Type Cost in EUR..." type="number" value="${job.cond_estimate_cost}" disabled/></div></div>`
                }
            }
            $('#append-grouped-estimate-cost').html(divString)
            self.calculateGroupSavings()
            $('#total-savings-div').show()
        }

        if (typeof foundIndividualJobs != 'undefined') {
            $('#individual-jobs-cost').show()
            $('#append-individual-cost').html('')
            let divString = ''
            for (let job of groupJobs) {
                if (job.cond_type == 'Individual') {
                    divString += `<div class="col-12"><div class="form-group"><label class="bold-label currency-label"> Job ${job.cond_ind_id} | Ref: ${job.cond_reference} (EUR)</label><input class="form-control currency-input individual-estimate-cost-input" data-id="${job.cond_id}" data-trigger-flag="ind-trigg-${job.cond_ind_id}" placeholder="Type Cost in EUR..." type="text" value="${job.cond_estimate_cost}" disabled/></div></div>`
                }
            }
            $('#append-individual-cost').html(divString)
        }

        $('#group-ex-select').val(data.con_group_ex)
        $('#group-to-select').val(data.con_group_to)
        $('#group-mode-select').val(data.con_group_mode)
        $('#service-type-select').val(data.con_group_service_type)
        $('#group-forwarder').val(data.con_group_forwarder)
        $('#group-deadline').val(data.con_group_deadline)

        $('#group-ex-select').trigger('chosen:updated')
        $('#group-to-select').trigger('chosen:updated')
        $('#group-mode-select').trigger('chosen:updated')
        $('#service-type-select').trigger('chosen:updated')

        $('#group-modal').modal('show')
        $('#save-group-data').attr('disabled', null)
    })
    $('#done_consolidations_table').on('click', 'i.flag-job', function () {
        const data = doneConsTable.row($(this).parents('tr')).data()
        Swal.fire({
            title: 'Highlight Job?',
            icon: 'warning',
            showCancelButton: true,
            showDenyButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#68bb69',
            confirmButtonText: 'Yes',
            denyButtonText: 'No',
            denyButtonColor: '#dc3545',
        }).then(async function (result) {
            if (result.isConfirmed) {
                await self.DB.updateGroupHighlight(data.cond_id, 1)
                self.refreshTable()
            }
            if (result.isDenied) {
                await self.DB.updateGroupHighlight(data.cond_id, 0)
                self.refreshTable()
            }
        })
    })

    $('#search_datatable').keyup(function () {
        doneConsTable.search('^' + $(this).val()).draw()
        if ($(this).val() != '') {
            let regexp = `\\b${$(this).val()}`
            doneConsTable.search(regexp, true, false).draw()
        } else {
            doneConsTable.search('').draw()
        }
    })
}

DoneConsolidationsClass.prototype.formatData = function (consolidations) {
    let self = this

    let retData = []
    let finalData = []
    let groupSumKG = {}
    for (let cons of consolidations) {
        cons.cond_request_date = self.Helpers.changeMysqlDateToNormal(cons.cond_request_date)
        cons.con_group_confirmation_date = self.Helpers.changeMysqlDateToNormal(cons.con_group_confirmation_date)

        if (typeof groupSumKG[cons.group_id] === 'undefined') groupSumKG[cons.group_id] = 0
        groupSumKG[cons.group_id] += cons.cond_kg
        retData.push(cons)
    }
    for (let con of retData) {
        try {
            if (con.cond_type == 'Grouped') {
                // Job was grouped
                con.cond_cost_per_kg = (con.con_group_cost / groupSumKG[con.group_id]).toFixed(2)
                con.cond_shared_cost = ((con.cond_kg * con.con_group_cost) / groupSumKG[con.group_id]).toFixed(2)
            }
            if (con.cond_type == 'Individual') {
                // Job is a simple individual
                con.cond_cost_per_kg = (con.cond_estimate_cost / con.cond_kg).toFixed(2)
                con.cond_shared_cost = con.cond_estimate_cost.toFixed(2)
            }
            if (con.cond_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) {
                // Job is a local dispatch
                con.cond_cost_per_kg = (con.con_group_local_cost / con.cond_kg).toFixed(2)
                con.cond_shared_cost = con.con_group_local_cost.toFixed(2)
            }
            finalData.push(con)
        } catch (err) {
            console.log(`Format Data Error:`, err)
            continue
        }
    }

    return finalData
}

DoneConsolidationsClass.prototype.appendConsolidationGroups = async function (to_name) {
    let self = this
    $('#con-group-radios').html('')
    $('#con-group-radios').append(`<label class="custom-control custom-radio dark">
        <input name="radio-stacked" class="custom-control-input con-group" type="radio" value="0" />
        <span class="custom-control-indicator"></span>
        <span class="custom-control-description">NEW CONSOLIDATION</span>
    </label>`)
    let conGroups = await self.DB.getConGroups()
    for (let conGroup of conGroups) {
        if (conGroup.city_name == to_name)
            $('#con-group-radios').append(`<label class="custom-control custom-radio dark">
            <input name="radio-stacked" class="custom-control-input con-group" type="radio" value="${conGroup.con_group_id}" />
            <span class="custom-control-indicator"></span>
            <span class="custom-control-description" style="background-color: ${conGroup.con_group_color}">CONSOLIDATION WITH ID: ${conGroup.con_group_id} VESSEL: ${conGroup.vessel}</span>
            </label>`)
    }
}

DoneConsolidationsClass.prototype.updateSelectedTableColors = function (myTable) {
    let self = this

    myTable.rows().every(function () {
        rowNode = this.node()
        rowData = this.data()
        if (self.selectedDoneInds.indexOf(rowData.cond_id) == -1) {
            $(rowNode).removeClass('datatableBack')
        } else {
            $(rowNode).addClass('datatableBack')
        }
    })
}

DoneConsolidationsClass.prototype.refreshTable = function () {
    let self = this
    $('#done_consolidations_table').unbind('click')
    $('#done_consolidations_table').DataTable().clear()
    $('#done_consolidations_table').DataTable().destroy()
    setTimeout(function () {
        self.initializetable()
    }, 2000)
}

DoneConsolidationsClass.prototype.findChoosenValueForCities = function (ex_city, to_city) {
    let self = this
    let cities = self.DB.cities
    for (i = 0; i < cities.length; i++) {
        if (cities[i].city_name == ex_city) {
            $('#group-ex-select').val(cities[i].city_id)
            $('#group-ex-select').trigger('chosen:updated')
        }
        if (cities[i].city_name == to_city) {
            $('#group-to-select').val(cities[i].city_id)
            $('#group-to-select').trigger('chosen:updated')
        }
    }
}

DoneConsolidationsClass.prototype.initialiazeCitiesSelect = function () {
    let self = this
    $('#group-ex-select').empty()
    $('#group-to-select').empty()
    $('#group-ex-select').append('<option></option>')
    $('#group-to-select').append('<option></option>')
    for (i = 0; i < self.DB.cities.length; i++) {
        $('#group-ex-select').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
        $('#group-to-select').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    }
    $('#group-ex-select').trigger('chosen:updated')
    $('#group-to-select').trigger('chosen:updated')
}

DoneConsolidationsClass.prototype.initializeServiceTypeSelect = function () {
    let self = this

    $('#service-type-select').empty()
    $('#service-type-select').append('<option></option>')
    for (i = 0; i < self.DB.consolidationServiceTypes.length; i++) {
        $('#service-type-select').append(
            new Option(self.DB.consolidationServiceTypes[i].service_type_description, self.DB.consolidationServiceTypes[i].service_type_id)
        )
    }
    $('#service-type-select').trigger('chosen:updated')
}

DoneConsolidationsClass.prototype.calculateGroupSavings = async function () {
    let self = this
    let totalIndCount = 0
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 500)
    })
    $('.grouped-estimate-cost-input').each(function () {
        if ($(this).val() == '') return
        totalIndCount = totalIndCount + parseFloat($(this).val())
    })
    $('#group-savings').val(self.Helpers.formatFloatValue(totalIndCount - $('#group-cost').val()))
}
