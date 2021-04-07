let ConsolidationsClass = function () {

    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.bindMovingEvents('add-consolidation-header');
    this.Helpers.bindMovingEvents('consolidation-cost-header');
    this.Helpers.initializeUser();
    this.bindEventsOnButtons();
    let self = this;
    setTimeout(function() {
        self.initializetable();

    }, 500)

    setTimeout(function() {

        $('#add-consolidation-btn').attr('disabled', null)

    },1000)


}

ConsolidationsClass.prototype.bindEventsOnButtons = function() {

    let self = this;

    $('#division-select').chosen()
    $('#product-select').chosen()
    $('#mode-select').chosen()
    $('#vessel-select').chosen()
    $('#ex-select-port').chosen()
    $('#ex-select-airport').chosen()
    $('#to-select-port').chosen()
    $('#to-select-airport').chosen()
    $('#type_select').chosen()
    $('#ex-input').chosen()
    $('#to-input').chosen()
    $('#actual_weight').mask('0000000000')
    $('#volume_weight').mask('0000000000')
    $('#length').mask('0000')
    $('#width').mask('0000')
    $('#height').mask('0000')
    $('#pieces').mask('0000')


    $('#logout-ref').on('click', function() {

        self.Helpers.handleLogout();

    })

    $('#add-consolidation-btn').on('click', function() {

        $('#modal-title-text').html('Add Consolidation')
        $('#save-job-btn').attr('disabled', null)
        $('#product-select').val('').attr('disabled', true).trigger("chosen:updated")
        $('#mode-select').val('').trigger("chosen:updated")
        $('#ex-select-airport-div').hide()
        $('#to-select-airport-div').hide()
        $('#to-input-div').hide()
        $('#ex-input-div').hide()
        $('#ex-select-port-div').hide()
        $('#to-select-port-div').hide()
        $('#forwarder').val('')
        $('#estimate_cost').val('')
        $('#carrier').val('')
        $('#notes').val('')
        $('#actual_weight').val('')
        $('#reference').val('')
        $('#length').val('')
        $('#width').val('')
        $('#height').val('')
        $('#pieces').val('')
        $('#volume_weight').val('')
        $('#deadline_date').val('')
        $('#cutoff_date').val('')


        $('#ex-select-port').val('').trigger("chosen:updated")
        $('#ex-select-airport').val('').trigger("chosen:updated")
        $('#to-select-port').val('').trigger("chosen:updated")
        $('#to-select-airport').val('').trigger("chosen:updated")
        $('#ex-input').val('').trigger("chosen:updated")
        $('#to-input').val('').trigger("chosen:updated")


        self.initializeDivisionsSelect();
        self.initialiazeVesselsSelect();
        self.initialiazeCitiesSelect();
        self.bindSaveEventOnSaveJobButton()

       $('#add-consolidation-modal').modal('show')

    })


    $('#division-select').on('change',function() {

        self.initializeProductsSelect($(this).val())


    })

    $('#mode-select').on('change', function() {

        self.initialiazeExToSelect($(this).val())

    })

    $('#save-consolidation-costs').on('click', function() {

        var conGroupcost = $('#consolidation_group_cost').val();
        var conGroupForwarder = $('#consolidation_group_forwarder').val();

        if (conGroupcost != '' && conGroupForwarder != '') {

            var jobCostData = {
                con_group_id: $('#consolidation_id').val(),
                con_group_cost: $('#consolidation_group_cost').val(),
                con_group_forwarder: $('#consolidation_group_forwarder').val(),


            }
            $('#consolidation-cost-modal').modal('hide')
            self.DB.updateConsolidationGroupCost(jobCostData);

        } else {

            self.Helpers.toastr('error', 'Some data are empty. Please try again.')
        }




    })


}

ConsolidationsClass.prototype.bindSaveEventOnSaveJobButton = function() {

    let self = this;
    $('#save-job-btn').unbind('click')


    $('#save-job-btn').on('click',function() {


        var modeSelectValue = $('#mode-select').val()
        var divisionSelectValue = $('#division-select').val()
        var productSelectValue = $('#product-select').val()
        var vesselSelectValue = $('#vessel-select').val()
        var actualWeight = $('#actual_weight').val()
        var volumeWeight = $('#volume_weight').val()
        var cutoffDate = $('#cutoff_date').val()
        var deadlinedate = $('#deadline_date').val()
        var reference = $('#reference').val()



        if (modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && actualWeight != '' && volumeWeight != '' && cutoffDate != '' && deadlinedate !='' && reference != '') {

            $(this).attr('disabled', 'disabled')
            var ind_ex = '';
            var ind_to = '';
            if (modeSelectValue == "Air") {

                ind_ex = $('#ex-select-airport').val();
                ind_to = $('#to-select-airport').val();

            } else if (modeSelectValue == "Sea") {

                ind_ex = $('#ex-select-port').val();
                ind_to = $('#to-select-port').val();


            } else {

                ind_ex = $('#ex-input').val();
                ind_to = $('#to-input').val();

            }


            if (ind_ex != '' && ind_to != '') {

                var consolidationData = {

                    con_user_id: self.Helpers.user_id,
                    con_division_id: divisionSelectValue,
                    con_product_id: productSelectValue,
                    con_mode: modeSelectValue,
                    con_reference: reference,
                    con_actual_weight: actualWeight,
                    con_length: ($('#length').val() == "") ? 0 : $('#length').val(),
                    con_width: ($('#width').val() == "") ? 0 : $('#width').val(),
                    con_height: ($('#height').val() == "") ? 0 : $('#height').val(),
                    con_pieces: ($('#pieces').val() == "") ? 0 : $('#pieces').val(),
                    con_volume_weight: volumeWeight,
                    con_chargable_weight: (volumeWeight > actualWeight) ? volumeWeight : actualWeight,
                    con_vessel_id: vesselSelectValue,
                    con_ex: ind_ex,
                    con_to: ind_to,
                    con_request_date: self.Helpers.getDateTimeNow(),
                    con_deadline: self.Helpers.changeDateToMysql($('#deadline_date').val()),
                    con_cut_off_date: self.Helpers.changeDateToMysql($('#cutoff_date').val()),
                    con_notes: $('#notes').val(),
                    con_carrier: ($('#carrier').val() == "") ? null : $('#carrier').val()


                }

                self.DB.addConsolidation(consolidationData);

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

ConsolidationsClass.prototype.initializetable = function() {
    let self= this;


    self.DB.getAllConsolidations(self.Helpers);
    self.DB.getAllDivisions();
    self.DB.getAllCities();
    self.DB.getAllProducts();
    self.DB.getAllVessels();
    self.DB.getAllPorts();
    self.DB.getAllAirports();
    self.DB.getAllColors();






}

ConsolidationsClass.prototype.initializeDivisionsSelect = function() {

    let self = this;

    $('#division-select').empty();
    $('#division-select').append("<option></option>")
    for (i=0; i < self.DB.divisions.length; i++) {


        $('#division-select').append(new Option(self.DB.divisions[i].division_description, self.DB.divisions[i].division_id))

    }
    $('#division-select').trigger("chosen:updated")
}

ConsolidationsClass.prototype.initializeProductsSelect = function(divisionID) {

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

ConsolidationsClass.prototype.initialiazeExToSelect = function(modeValue) {

    let self = this;



    switch (modeValue) {
        case "Air":
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()
            $('#to-input-div').hide()
            $('#ex-input-div').hide()


            $('#ex-select-airport-div').show('500');
            $('#to-select-airport-div').show('500');
            break;
        case "Sea":
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()
            $('#to-input-div').hide()
            $('#ex-input-div').hide()

            $('#ex-select-port-div').show('500');
            $('#to-select-port-div').show('500');
            break;
        default:
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()

            $('#to-input-div').show('500')
            $('#ex-input-div').show('500')
            break;





    }



}

ConsolidationsClass.prototype.initialiazeVesselsSelect = function() {

    let self = this;
    $('#vessel-select').empty();
    $('#vessel-select').append("<option></option>")
    for (i=0; i < self.DB.vessels.length; i++) {


        $('#vessel-select').append(new Option(self.DB.vessels[i].vessel_description, self.DB.vessels[i].vessel_id))

    }
    $('#vessel-select').trigger("chosen:updated")

}

ConsolidationsClass.prototype.initialiazeCitiesSelect = function() {

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



