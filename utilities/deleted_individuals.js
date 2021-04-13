let DeletedIndividualsClass  = function () {

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

DeletedIndividualsClass.prototype.bindEventsOnButtons = function() {

    let self = this;


    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })


}


DeletedIndividualsClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllDeletedIndividuals(self.Helpers);



}


