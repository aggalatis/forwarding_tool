let addDataClass  = function () {


    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();

    setTimeout(function() {
        self.initializeDeleteSelects();

    }, 500)

    setTimeout(function() {
        self.initialiazeCitiesSelect();
        self.initialiazeVesselsSelect();

    }, 1000)

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

    $('#delete-data').on('click', function() {
        let del_type = $('#del-data-type-select').val()
        console.log($('#del-data-type-select').val())
        if (del_type == "del-city") {
            let city_id = $('#del-city-select').val()
            if (city_id != "") {
                self.DB.deleteCity(city_id)
            } else {
                self.Helpers.toastr('error', 'Some fields are empty. Please try again')

            }

        }

        if (del_type == "del-vessel") {
            let vessel_id = $('#del-vessel-select').val()
            if (vessel_id != "") {
                self.DB.deleteVessel(vessel_id)
            } else {
                self.Helpers.toastr('error', 'Some fields are empty. Please try again')
            }

        }

    })



}

addDataClass.prototype.initializeDeleteSelects = function() {

    let self = this;
    self.DB.getAllCities();
    self.DB.getAllVessels();


    $('#del-data-type-select').chosen();
    $('#del-city-select').chosen();
    $('#del-vessel-select').chosen();
    $('#del-city-div').hide()
    $('#del-vessel-div').hide()

    $('#del-data-type-select').on('change', function() {
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

addDataClass.prototype.initialiazeVesselsSelect = function() {

    let self = this;
    $('#del-vessel-select').empty();
    $('#del-vessel-select').append("<option></option>")
    for (i=0; i < self.DB.vessels.length; i++) {


        $('#del-vessel-select').append(new Option(self.DB.vessels[i].vessel_description, self.DB.vessels[i].vessel_id))

    }
    $('#del-vessel-select').trigger("chosen:updated")

}

addDataClass.prototype.initialiazeCitiesSelect = function() {

    let self = this;
    $('#del-city-select').empty();
    $('#del-city-select').append("<option></option>")
    for (i=0; i < self.DB.cities.length; i++) {

        $('#del-city-select').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))

    }
    $('#del-city-select').trigger("chosen:updated")

}

