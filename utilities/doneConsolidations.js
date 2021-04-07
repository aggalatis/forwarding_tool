let DoneConsolidationsClass  = function () {

    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.bindMovingEvents('cost-done-cons-head');
    this.Helpers.bindMovingEvents('edit-notes-consolidation-head');
    this.Helpers.initializeUser();
    this.bindEventsOnButtons();
    let self = this;
    setTimeout(function() {
        self.initializetable();

    }, 500)


}

DoneConsolidationsClass.prototype.bindEventsOnButtons = function() {

    let self = this;


    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })

    $('#save-consol-notes').on('click', function() {

        var jobID = $('#done_consolidation_id').val();
        var notesText = $('#notes').val();
        $('#consol-notes-modal').modal('hide')
        self.DB.saveConsolidationNotes(jobID, notesText);


    })


}


DoneConsolidationsClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllDoneConsolidations(self.Helpers);



}

