let IndividualsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initInstructionFiles(this.DB)
    this.Helpers.bindMovingEvents('help-modal-header')
    this.Helpers.initializeUser()
    this.Helpers.bindMovingEvents('edit-notes-modal-header')
    this.Helpers.bindMovingEvents('cost-data-modal-header')
    this.Helpers.bindMovingEvents('done-personnel-modal-header')
    this.Helpers.bindMovingEvents('assignment-modal-header')
    this.bindEventsOnButtons()
    this.selectedJobs = []
    let self = this
    setTimeout(function () {
        self.initializetable()
    }, 500)
}

IndividualsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#save-notes').on('click', function () {
        var jobID = $('#done_ind_id').val()
        var notesText = $('#notes').val()

        self.DB.saveNotesChanges(jobID, notesText)
    })

    $('#assign-btn').on('click', () => {
        if (self.DB.selectedDoneInd.length == 0) {
            Swal.fire({
                title: 'Select jobs for assignment',
                text: 'Unfortunately you need to select some jobs before you can assign them to consolidation.',
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        if (!self.Helpers.jobsHaveSameDestination(self.DB.selectedDoneDestination)) {
            Swal.fire({
                title: 'Job destination mismatch',
                text: `Unfortunately all jobs selected don't have the same destination.`,
                icon: 'error',
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        self.appendConsolidationGroups(self.DB.selectedDoneDestination[0])
        $('#assignment-group-modal').modal('show')
    })

    $('#assign-jobs').on('click', () => {
        let selGroup = $('input.con-group:checked').val()
        if (typeof selGroup === 'undefined') {
            self.Helpers.toastr('warning', 'Please select a group first.')
            return
        }
        if (selGroup == 0) {
            self.DB.assignJobsToNewGroup()
        } else {
            self.DB.assignJobsToConGroup(selGroup)
        }
    })
}

IndividualsClass.prototype.initializetable = async function () {
    let self = this

    self.DB.getAllDoneIndividuals(self.Helpers)
    self.DB.getAllColors()
}

IndividualsClass.prototype.appendConsolidationGroups = async function (to_name) {
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
                <span class="custom-control-description" style="background-color: ${conGroup.con_group_color}">CONSOLIDATION ID: ${conGroup.con_group_id}</span>
                </label>`)
    }
}
