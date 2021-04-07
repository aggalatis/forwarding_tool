let TransfersClass = function () {

    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();
    this.Helpers.bindMovingEvents('job-modal-header');
    this.Helpers.bindMovingEvents('cost-modal-header');
    this.bindEventsOnButtons();
    let self = this;
    setTimeout(function() {
        self.initializetable();

    }, 500)

    setTimeout(function() {

        $('#add-job-btn').attr('disabled', null)

    },1000)


}

TransfersClass.prototype.bindEventsOnButtons = function() {

    let self = this;

    $('#division-select').chosen()
    $('#product-select').chosen()
    $('#mode-select').chosen()
    $('#vessel-select').chosen()
    $('#ex-input').chosen()
    $('#to-input').chosen()
    $('#type_select').chosen()

    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })

    $('#add-job-btn').on('click', function() {


        $('#modal-title-text').html('Add Individual')
        $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        $('#save-job-btn').attr('disabled', null)
        $('#product-select').val('').attr('disabled', true).trigger("chosen:updated")
        $('#mode-select').val('').trigger("chosen:updated")
        $('#scheldure_select').val('').trigger("chosen:updated")
        $('#ex-select-airport-div').hide()
        $('#to-select-airport-div').hide()
        $('#ex-select-port-div').hide()
        $('#to-select-port-div').hide()
        $('#forwarder').val('')
        $('#estimate_cost').val('')



        $('#carrier').val('')
        $('#notes').val('')
        $('#cutoff_date').val('')
        $('#deadline_date').val('')


        $('#ex-select-port').val('').trigger("chosen:updated")
        $('#ex-select-airport').val('').trigger("chosen:updated")
        $('#to-select-port').val('').trigger("chosen:updated")
        $('#to-select-airport').val('').trigger("chosen:updated")
        $('#ex-input').val('').trigger("chosen:updated")
        $('#to-input').val('').trigger("chosen:updated")


        self.initializeDivisionsSelect();
        self.initialiazeVesselsSelect();
        self.initialiazeCitiesSelect();
        self.bindSaveEventOnSaveJobButton();

       $('#add-job-modal').modal('show')

    })


    $('#division-select').on('change',function() {

        self.initializeProductsSelect($(this).val())


    })

    $('#save-costs').on('click', function() {

        var groupCost = $('#group_cost').val();
        var groupCutoffDatte = $('#group_cut_off_date').val();
        var groupForwarder = $('#group_forwarder').val();

        if (groupCost != '' && groupCutoffDatte != '' && groupForwarder != '') {

            var jobCostData = {
                ind_group_id: $('#group_id').val(),
                ind_group_cost: $('#group_cost').val(),
                ind_group_cut_off_date: self.Helpers.changeDateToMysql($('#group_cut_off_date').val()),
                ind_group_forwarder: $('#group_forwarder').val()


            }

            self.DB.updateGroupCost(jobCostData);

        } else {

            self.Helpers.toastr('error', 'Some data are empty. Please try again.')
        }



    })

    $('#add-city-btn').on('click',function() {

        self.Helpers.addCityAlert(self.DB, self)

    })

    $('#refresh-city-btn').on('click', function() {
        self.DB.getAllCities();
        setTimeout(function() {
            self.initialiazeCitiesSelect()
        }, 1000)

    })

}

TransfersClass.prototype.bindSaveEventOnSaveJobButton = function() {

    let self = this;

    $('#save-job-btn').unbind('click')


    $('#save-job-btn').on('click',function() {


        var modeSelectValue = $('#mode-select').val()
        var divisionSelectValue = $('#division-select').val()
        var productSelectValue = $('#product-select').val()
        var vesselSelectValue = $('#vessel-select').val()
        var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
        var forwarder = $('#forwarder').val()
        var ind_ex = $('#ex-input').val();
        var ind_to = $('#to-input').val();

        console.log(productSelectValue)
        exit();
        if (modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && estimatecostSelectValue != '' && forwarder != '') {

            $(this).attr('disabled', 'disabled')
            if (ind_ex != '' && ind_to != '') {

                var individual_id = {

                    ind_user_id: self.Helpers.user_id,
                    ind_division_id: divisionSelectValue,
                    ind_product_id: productSelectValue.join(','),
                    ind_mode: $('#mode-select').val(),
                    ind_vessel_id: vesselSelectValue.join(','),
                    ind_ex: ind_ex,
                    ind_to: ind_to,
                    ind_timescheldure: $('#scheldure_select').val(),
                    ind_request_date: self.Helpers.getDateTimeNow(),
                    ind_deadline: self.Helpers.changeDateToMysql($('#deadline_date').val()),
                    ind_cut_off_date: self.Helpers.changeDateToMysql($('#cutoff_date').val()),
                    ind_forwarder: forwarder,
                    ind_notes: $('#notes').val(),
                    ind_estimate_cost: estimatecostSelectValue,
                    ind_carrier: $('#carrier').val(),
                    ind_group_id: 0


                }

                self.DB.addIndividual(individual_id);
            } else {
                $(this).attr('disabled', null)
                self.Helpers.toastr('error', 'Some required fields are empty.')
            }



        } else {

            $(this).attr('disabled', null)
            self.Helpers.toastr('error', 'Some required fields are empty.')
        }





    })


}

TransfersClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllIndividuals(self.Helpers);
    self.DB.getAllDivisions();
    self.DB.getAllCities();
    self.DB.getAllProducts();
    self.DB.getAllVessels();
    self.DB.getAllColors();






}

TransfersClass.prototype.initializeDivisionsSelect = function() {

    let self = this;

    $('#division-select').empty();
    $('#division-select').append("<option></option>")
    for (i=0; i < self.DB.divisions.length; i++) {


        $('#division-select').append(new Option(self.DB.divisions[i].division_description, self.DB.divisions[i].division_id))

    }
    $('#division-select').trigger("chosen:updated")
}

TransfersClass.prototype.initializeProductsSelect = function(divisionID) {

    let self = this;
    $('#product-select').empty();
    $('#product-select').append("<option></option>")
    for (i=0; i < self.DB.products.length; i++) {

        if(divisionID == self.DB.products[i].product_division_id) {

            $('#product-select').append(new Option(self.DB.products[i].product_description, self.DB.products[i].product_id))
        }
        $('#product-select').attr('disabled', false).trigger("chosen:updated")


    }

}


TransfersClass.prototype.initialiazeVesselsSelect = function() {

    let self = this;
    $('#vessel-select').empty();
    $('#vessel-select').append("<option></option>")
    for (i=0; i < self.DB.vessels.length; i++) {


        $('#vessel-select').append(new Option(self.DB.vessels[i].vessel_description, self.DB.vessels[i].vessel_id))

    }
    $('#vessel-select').trigger("chosen:updated")

}

TransfersClass.prototype.initialiazeCitiesSelect = function() {

    let self = this;
    $('#ex-input').empty();
    $('#to-input').empty();
    $('#ex-input').append("<option></option>")
    $('#to-input').append("<option></option>")
    for (i=0; i < self.DB.cities.length; i++) {


        $('#ex-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_name))
        $('#to-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_name))

    }
    $('#ex-input').trigger("chosen:updated")
    $('#to-input').trigger("chosen:updated")

}

