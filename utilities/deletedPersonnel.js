let DeletedPersonnelClass  = function () {

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

DeletedPersonnelClass.prototype.bindEventsOnButtons = function() {

    let self = this;


    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })


}


DeletedPersonnelClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllDeletedIndividuals(self.Helpers);



}


