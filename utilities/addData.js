let addDataClass  = function () {


    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();

    let self = this;

    this.addEventsOnButtons();


}

addDataClass.prototype.addEventsOnButtons = function() {


    let self = this;

    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })


    $('#data-type-select').chosen();

    $('#add-new-data').on('click', function() {

        $(this).attr('disabled', 'disabled')
        var dataType = $('#data-type-select').val();
        var dataValue = $('#data-value').val();

        if (dataType !== '' && dataValue !== '') {

            switch(dataType) {
                case "city":
                    self.DB.addCity(dataValue)
                    break;
                case "vessel":
                    self.DB.addVessel(dataValue)
                    break;
                default:
                    console.log("nothing to add")
                    $('#add-new-data').attr('disabled', null)

            }

        } else {
            $('#add-new-data').attr('disabled', null)
            self.Helpers.toastr('error', 'Some fields are empty. Please try again')
    }

    })

}


