let PersonnelClass = function () {

    this.DB = new DbClass();
    this.Helpers = new HelpersClass();
    this.Helpers.initializeUser();
    this.Helpers.bindMovingEvents('job-modal-header');
    this.bindEventsOnButtons();
    let self = this;
    setTimeout(function() {
        self.initializetable();

    }, 500)

    setTimeout(function() {

        $('#add-per-btn').attr('disabled', null)

    },1000)


}

PersonnelClass.prototype.bindEventsOnButtons = function() {

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

    $('#add-per-btn').on('click', function() {

        //empty all fields
        $('#modal-title-text').html('Add Personnel')
        $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        $('#save-per-btn').attr('disabled', null)
        $('#product-select').val('').attr('disabled', true).trigger("chosen:updated")
        $('#mode-select').val('').trigger("chosen:updated")
        $('#estimate_cost').val('')
        $('#actual_cost').val('')
        $('#saving').val('')
        $('#name').val('')
        $('#kg').val('')
        $('#notes').val('')
        $('#deadline_date').val('')
        $('#ex-input').val('').trigger("chosen:updated")
        $('#to-input').val('').trigger("chosen:updated")


        self.initializeDivisionsSelect();
        self.initialiazeVesselsSelect();
        self.initialiazeCitiesSelect();
        self.bindSaveEventOnSaveJobButton();

        $('#add-per-modal').modal('show')

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

    $('#estimate_cost').on('change', function() {

        $('#saving').val($(this).val() - $('#actual_cost').val())
    })

    $('#actual_cost').on('change', function() {
        $('#saving').val($('#estimate_cost').val() - $(this).val())
    })

}

PersonnelClass.prototype.bindSaveEventOnSaveJobButton = function() {

    let self = this;

    $('#save-per-btn').unbind('click')


    $('#save-per-btn').on('click',function() {

        var modeSelectValue = $('#mode-select').val()
        var divisionSelectValue = $('#division-select').val()
        var productSelectValue = $('#product-select').val()
        var vesselSelectValue = $('#vessel-select').val()
        var per_ex = $('#ex-input').val();
        var per_to = $('#to-input').val();
        var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
        var actualCostValue = self.Helpers.formatFloatValue($('#actual_cost').val())
        var name = $('#name').val()
        var savings = self.Helpers.formatFloatValue($('#saving').val())
        var kg = $('#kg').val();
        var deadline = $('#deadline_date').val()

        if (deadline != '' & modeSelectValue != '' && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '' && estimatecostSelectValue != '' && actualCostValue != '' && name != '' && name != '') {

            $(this).attr('disabled', 'disabled')

            //change productIds to product Names
            var productsNames = [];
            for (i = 0; i < self.DB.products.length; i++) {
                if (productSelectValue.indexOf(self.DB.products[i].product_id.toString()) !== -1) {
                    //this means i found the product
                    productsNames.push(self.DB.products[i].product_description)
                }
            }

            var vesselsNames = [];
            for (i = 0; i < self.DB.vessels.length; i++) {
                if (vesselSelectValue.indexOf(self.DB.vessels[i].vessel_id.toString()) !== -1) {
                    //this means i found the vessel
                    vesselsNames.push(self.DB.vessels[i].vessel_description)
                }
            }
            if (per_ex != '' && per_to != '') {

                var personnelData = {

                    per_user_id: self.Helpers.user_id,
                    per_division_id: divisionSelectValue,
                    per_products: productsNames.join(';'),
                    per_vessels: vesselsNames.join(';'),
                    per_mode: modeSelectValue,
                    per_ex: per_ex,
                    per_to: per_to,
                    per_name: name,
                    per_kg: kg,
                    per_deadline: self.Helpers.changeDateToMysql(deadline),
                    per_estimate_cost: estimatecostSelectValue,
                    per_actual_cost: actualCostValue,
                    per_savings: savings,
                    per_notes: $('#notes').val()


                }
                console.log(personnelData)
                self.DB.addPersonnel(personnelData);
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

PersonnelClass.prototype.initializetable = function() {
    let self= this;

    self.DB.getAllPersonnel(self.Helpers);
    self.DB.getAllDivisions();
    self.DB.getAllCities();
    self.DB.getAllProducts();
    self.DB.getAllVessels();
    self.DB.getAllColors();

}

PersonnelClass.prototype.initializeDivisionsSelect = function() {

    let self = this;

    $('#division-select').empty();
    $('#division-select').append("<option></option>")
    for (i=0; i < self.DB.divisions.length; i++) {


        $('#division-select').append(new Option(self.DB.divisions[i].division_description, self.DB.divisions[i].division_id))

    }
    $('#division-select').trigger("chosen:updated")
}

PersonnelClass.prototype.initializeProductsSelect = function(divisionID) {

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

PersonnelClass.prototype.initialiazeVesselsSelect = function() {

    let self = this;
    $('#vessel-select').empty();
    $('#vessel-select').append("<option></option>")
    for (i=0; i < self.DB.vessels.length; i++) {


        $('#vessel-select').append(new Option(self.DB.vessels[i].vessel_description, self.DB.vessels[i].vessel_id))

    }
    $('#vessel-select').trigger("chosen:updated")

}

PersonnelClass.prototype.initialiazeCitiesSelect = function() {

    let self = this;
    $('#ex-input').empty();
    $('#to-input').empty();
    $('#ex-input').append("<option></option>")
    $('#to-input').append("<option></option>")
    for (i=0; i < self.DB.cities.length; i++) {


        $('#ex-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
        $('#to-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))

    }
    $('#ex-input').trigger("chosen:updated")
    $('#to-input').trigger("chosen:updated")

}

