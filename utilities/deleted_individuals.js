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

    $('#empty-trashcan').on('click', function() {
        Swal.fire({
            title: "Are you sure?",
            text: "If you empty your trash can you won't be able to find these jobs!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Confirm",

        }).then((result) => {
            if (result.isConfirmed) {
            self.DB.emptyDeletedIndividuals();

        }})

    })


}


DeletedIndividualsClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllDeletedIndividuals(self.Helpers);



}


