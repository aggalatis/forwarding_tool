let DoneConsolidationsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initInstructionFiles(this.DB)
    this.Helpers.bindMovingEvents('help-modal-header')
    this.Helpers.bindMovingEvents('cost-done-cons-head')
    this.Helpers.bindMovingEvents('edit-notes-consolidation-head')
    this.Helpers.initializeUser()
    this.bindEventsOnButtons()
    this.selectedDoneInds = []
    this.selectedDoneDestination = []
    let self = this
    setTimeout(function () {
        self.initializetable()
    }, 500)
}

DoneConsolidationsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#save-consol-notes').on('click', function () {
        var jobID = $('#done_consolidation_id').val()
        var notesText = $('#notes').val()
        $('#consol-notes-modal').modal('hide')
        self.DB.saveConsolidationNotes(jobID, notesText)
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
            { title: 'ID', orderable: false, data: 'cond_id' },
            { title: 'GROUP ID', orderable: false, data: 'group_id' },
            { title: 'REQ. DATE', orderable: false, data: 'cond_request_date' },
            { title: 'USER', orderable: false, data: 'user_username' },
            { title: 'DEPARTMENT', orderable: false, data: 'division_description' },
            { title: 'PRODUCTS', orderable: false, data: 'cond_products' },
            { title: 'MODE', orderable: false, data: 'con_group_mode' },
            { title: 'SERVICE TYPE', orderable: false, data: 'service_type_description' },
            { title: 'VESSELS', orderable: false, data: 'cond_vessels' },
            { title: 'EX', orderable: false, className: 'danger-header', data: 'ex_name' },
            { title: 'TO', orderable: false, className: 'danger-header', data: 'to_name' },
            { title: 'DEADLINE', orderable: false, className: 'danger-header', data: 'con_group_deadline' },
            { title: 'CONFIRMATION DATE	', orderable: false, data: 'con_group_confirmation_date' },
            { title: 'FORWARDER', orderable: false, data: 'con_group_forwarder' },
            { title: 'REFERENCE', orderable: false, data: 'cond_reference' },
            { title: 'CONSOL. COST', orderable: false, data: 'con_group_cost' },
            { title: 'KG', orderable: false, data: 'cond_kg' },
            { title: 'COST / KG (€)', orderable: false, data: 'cond_cost_per_kg' },
            { title: 'SHARED CONS COST (€)', visible: true, data: 'cond_shared_cost' },
            {
                title: 'RE - CONSOLIDATED',
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
                title: 'ACTIONS',
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.cond_status != 'Done') {
                        $(td).children('.select-done-jobs').hide()
                    }
                },
                defaultContent: "<i class='fa fa-crosshairs select-done-jobs action-btn' title='select' style='cursor: pointer' title='select'></i>",
            },
        ],
        rowCallback: function (row, data, index, cells) {
            //Here I am changing background Color
            // $("td", row).css("background-color", data.con_group_color)
        },
        order: [[1, 'asc']],
        pageLength: 25,
    })
    $('#done_consolidations_table').on('click', 'i.select-done-jobs', function () {
        var data = doneConsTable.row($(this).parents('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            Swal.fire({
                title: 'Unable to edit this job.',
                text: "Unfortunately this is a job inserted by different user. You can't select it.",
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        if (data.cond_consolidated != null && data.cond_consolidated != 0) {
            Swal.fire({
                title: 'Job Re-Consolidated',
                text: 'Unfortunately the job you selected is already consolidated.',
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        if (self.selectedDoneInds.indexOf(data.cond_id) == -1) {
            $(this).parents('tr').addClass('datatableBack')
            self.selectedDoneInds.push(data.cond_id)
            self.selectedDoneDestination.push(data.to_name)
        } else {
            $(this).parents('tr').removeClass('datatableBack')
            self.selectedDoneInds.splice(self.selectedDoneInds.indexOf(data.cond_id), 1)
            self.selectedDoneDestination.splice(self.selectedDoneDestination.indexOf(data.to_name), 1)
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
        con.cond_cost_per_kg = (con.con_group_cost / groupSumKG[con.group_id]).toFixed(2)
        con.cond_shared_cost = ((con.cond_kg * con.con_group_cost) / groupSumKG[con.group_id]).toFixed(2)
        finalData.push(con)
    }

    return finalData
}

DoneConsolidationsClass.prototype.appendConsolidationGroups = async function (to_name) {
    let self = this

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
            <span class="custom-control-description" style="background-color: ${conGroup.con_group_color}">CONSOLIDATION WITH ID: ${conGroup.con_group_id}</span>
            </label>`)
    }
}
