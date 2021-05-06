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
    $('#del-data-type-select').chosen();
    $('#del-city-select').chosen();
    $('#del-vessel-select').chosen();

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

    $('#del-data-type-select').on('change', function() {
        console.log($(this).val())
        let chosen_value = $(this).val()

        if (chosen_value == 'del-city') {
            $('#del-vessel-div').hide()
            $('#del-city-div').show(350)

        }
        if (chosen_value == 'del-vessel') {
            $('#del-city-div').hide()
            $('#del-vessel-div').show(350)

        }

    })

}


