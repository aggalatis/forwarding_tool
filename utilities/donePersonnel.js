let DonePersonnelClass  = function () {

    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();
    this.Helpers.bindMovingEvents('edit-notes-modal-header');
    this.Helpers.bindMovingEvents('cost-data-modal-header');
    this.Helpers.initializeUser();
    this.bindEventsOnButtons();
    let self = this;
    setTimeout(function() {
        self.initializetable();

    }, 500)



}

DonePersonnelClass.prototype.bindEventsOnButtons = function() {

    let self = this;


    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })

    $('#save-notes').on('click', function() {

        var jobID = $('#done_per_id').val();
        var notesText = $('#notes').val();

        self.DB.savePerNotesChanges(jobID, notesText);


    })


}


DonePersonnelClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllDonePersonnel(self.Helpers);



}


