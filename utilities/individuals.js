let IndividualsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initializeUser()
    this.Helpers.bindMovingEvents("edit-notes-modal-header")
    this.Helpers.bindMovingEvents("cost-data-modal-header")
    this.Helpers.bindMovingEvents("done-personnel-modal-header")
    this.Helpers.bindMovingEvents("assignment-modal-header")
    this.bindEventsOnButtons()
    this.selectedJobs = []
    let self = this
    setTimeout(function () {
        self.initializetable()
        self.appendConsolidationGroups()
    }, 500)
}

IndividualsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $("#logout-ref").on("click", function () {
        self.Helpers.handleLogout()
    })

    $("#save-notes").on("click", function () {
        var jobID = $("#done_ind_id").val()
        var notesText = $("#notes").val()

        self.DB.saveNotesChanges(jobID, notesText)
    })

    $("#assign-btn").on("click", () => {
        if (self.DB.selectedDoneInd.length == 0) {
            Swal.fire({
                title: "Select jobs for assignment",
                text: "Unfortunately you need to select some jobs before you can assign them to consolidation.",
                icon: "error",
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        $("#assignment-group-modal").modal("show")
    })

    $("#assign-jobs").on("click", () => {
        let selGroup = $("input.con-group:checked").val()
        if (typeof selGroup === "undefined") {
            self.Helpers.toastr("warning", "Please select a group first.")
            return
        }
        if (selGroup == 0) {
            self.DB.assignJobsToNewGroup()
        } else {
            self.DB.assignJobsToGroup()
        }
    })
}

IndividualsClass.prototype.initializetable = async function () {
    let self = this

    self.DB.getAllDoneIndividuals(self.Helpers)
    self.DB.getAllColors()
}

IndividualsClass.prototype.appendConsolidationGroups = async function () {
    let self = this
    let conGroups = await self.DB.getConGroups()
}
