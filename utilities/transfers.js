let TransfersClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initializeUser()
    this.Helpers.bindMovingEvents('job-modal-header')
    this.Helpers.bindMovingEvents('cost-modal-header')
    this.Helpers.bindMovingEvents('personnel-modal-header')
    this.bindEventsOnButtons()
    let self = this
    setTimeout(function () {
        self.initializetable()
    }, 500)

    setTimeout(function () {
        $('#add-job-btn').attr('disabled', null)
    }, 1000)
}

TransfersClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#division-select').chosen()
    $('#product-select').chosen()
    $('#mode-select').chosen()
    $('#service-type-select').chosen()
    $('#vessel-select').chosen()
    $('#ex-input').chosen()
    $('#to-input').chosen()
    $('#type_select').chosen()
    $('#group-to-select').chosen()
    $('#group-ex-select').chosen()

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#add-job-btn').on('click', function () {
        //empty all fields
        $('#modal-title-text').html('Add Individual')
        $('#job-modal-header').removeClass('noFloat floatMeLeft floatMeRight')
        $('#save-job-btn').attr('disabled', null)
        $('#product-select').val('').attr('disabled', true).trigger('chosen:updated')
        $('#mode-select').val('').trigger('chosen:updated')
        $('#scheldure_select').val('').trigger('chosen:updated')
        $('#forwarder').val('')
        $('#estimate_cost').val('')
        $('#reference').val('')
        $('#kg').val('')
        $('#notes').val('')
        $('#deadline_date').val('')
        $('#ex-input').val('').trigger('chosen:updated')
        $('#to-input').val('').trigger('chosen:updated')

        self.initializeDivisionsSelect()
        self.initialiazeVesselsSelect()
        self.initialiazeCitiesSelect()
        self.initialiazeServiceTypeSelect()
        self.bindSaveEventOnSaveJobButton()

        $('#add-job-modal').modal('show')
    })

    $('#division-select').on('change', function () {
        self.initializeProductsSelect($(this).val())
    })

    $('#save-costs').on('click', function () {
        var groupCost = $('#group_cost').val()
        var groupActive = 0
        var groupDeadline = $('#group_cut_off_date').val()
        var groupForwarder = $('#group_forwarder').val()
        var groupTo = $('#group-to-select').val()
        var groupEx = $('#group-ex-select').val()

        if (groupDeadline != '' && groupTo != '' && groupEx != '') {
            console.log(groupCost)
            if (groupCost == '') {
                console.log('I am here....')
                groupCost = null
                groupActive = 1
            }
            var jobCostData = {
                ind_group_id: $('#group_id').val(),
                ind_group_cost: groupCost,
                ind_group_deadline: self.Helpers.changeDateToMysql(groupDeadline),
                ind_group_forwarder: groupForwarder,
                ind_group_to: groupTo,
                ind_group_ex: groupEx,
                ind_group_active: groupActive,
            }

            self.DB.updateGroupCost(jobCostData)
        } else {
            self.Helpers.toastr('error', 'Some data are empty. Please try again.')
        }
    })

    $('#add-city-btn').on('click', function () {
        self.Helpers.addCityAlert(self.DB, self)
    })

    $('#service-type-info').on('click', function () {
        Swal.fire({
            title: 'Service Type info.',
            text: 'If "OFFLAND DISPATCH" is selected, in EX insert the city that the port is in and in TO insert the city of your repair shop / warehouse.',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: false,
        })
        return
    })

    $('#refresh-city-btn').on('click', function () {
        self.DB.getAllCities()
        setTimeout(function () {
            self.initialiazeCitiesSelect()
        }, 1000)
    })

    $('#remove-date').on('click', function () {
        $('#deadline_date').val('TBA')
    })

    $('#personnel-actual-cost').on('keyup', function () {
        var personnelSavings = $('#personnel-estimate-cost').val() - $('#personnel-actual-cost').val()
        var personnelSavingsPercent = (personnelSavings / $('#personnel-estimate-cost').val()) * 100
        $('#personnel-savings').val(personnelSavings)
        $('#personnel-savings-percent').val(personnelSavingsPercent)
    })

    $('#save-personnel-costs').on('click', function () {
        var personnelId = $('#personnel-id').val()
        var personnelActualCost = $('#personnel-actual-cost').val()

        if (personnelActualCost != '') {
            personnelActualCost = self.Helpers.formatFloatValue(personnelActualCost)
            self.DB.updatePersonnelCosts(personnelId, personnelActualCost)
        } else {
            self.Helpers.toastr('error', 'Some data are empty. Please try again.')
        }
    })
}

TransfersClass.prototype.bindSaveEventOnSaveJobButton = function () {
    let self = this

    $('#save-job-btn').unbind('click')

    $('#save-job-btn').on('click', function () {
        var modeSelectValue = $('#mode-select').val()
        var divisionSelectValue = $('#division-select').val()
        var productSelectValue = $('#product-select').val()
        var vesselSelectValue = $('#vessel-select').val()
        var estimatecostSelectValue = self.Helpers.formatFloatValue($('#estimate_cost').val())
        var forwarder = $('#forwarder').val()
        var ind_ex = $('#ex-input').val()
        var ind_to = $('#to-input').val()
        var reference = $('#reference').val()
        var kg = self.Helpers.formatFloatValue($('#kg').val())
        var deadline = $('#deadline_date').val()
        let serviceType = $('#service-type-select').val()

        if ((deadline != '') & (modeSelectValue != '') && divisionSelectValue != '' && productSelectValue != '' && vesselSelectValue != '') {
            $(this).attr('disabled', 'disabled')

            //change productIds to product Names
            var productsNames = []
            for (i = 0; i < self.DB.products.length; i++) {
                if (productSelectValue.indexOf(self.DB.products[i].product_id.toString()) !== -1) {
                    //this means i found the product
                    productsNames.push(self.DB.products[i].product_description)
                }
            }

            var vesselsNames = []
            for (i = 0; i < self.DB.vessels.length; i++) {
                if (vesselSelectValue.indexOf(self.DB.vessels[i].vessel_id.toString()) !== -1) {
                    //this means i found the vessel
                    vesselsNames.push(self.DB.vessels[i].vessel_description)
                }
            }
            if (ind_ex != '' && ind_to != '') {
                var individualData = {
                    ind_user_id: self.Helpers.user_id,
                    ind_division_id: divisionSelectValue,
                    ind_products: productsNames.join(';'),
                    ind_mode: modeSelectValue,
                    ind_vessels: vesselsNames.join(';'),
                    ind_ex: ind_ex,
                    ind_to: ind_to,
                    ind_deadline: self.Helpers.changeDateToMysql(deadline),
                    ind_forwarder: forwarder,
                    ind_notes: $('#notes').val(),
                    ind_estimate_cost: estimatecostSelectValue,
                    ind_group_id: 0,
                    ind_reference: reference,
                    ind_kg: kg,
                    ind_service_type: serviceType,
                }
                console.log(individualData)
                self.DB.addIndividual(individualData)
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

TransfersClass.prototype.initializetable = function () {
    let self = this

    self.DB.getAllIndividuals()
    self.DB.getAllDivisions()
    self.DB.getAllCities()
    self.DB.getAllProducts()
    self.DB.getAllVessels()
    self.DB.getAllColors()
    self.DB.getAllServiceTypes()
}

TransfersClass.prototype.initializeDivisionsSelect = function () {
    let self = this

    $('#division-select').empty()
    $('#division-select').append('<option></option>')
    for (i = 0; i < self.DB.divisions.length; i++) {
        $('#division-select').append(new Option(self.DB.divisions[i].division_description, self.DB.divisions[i].division_id))
    }
    $('#division-select').trigger('chosen:updated')
}

TransfersClass.prototype.initializeProductsSelect = function (divisionID) {
    let self = this
    $('#product-select').empty()
    $('#product-select').append('<option></option>')
    for (i = 0; i < self.DB.products.length; i++) {
        if (divisionID == self.DB.products[i].product_division_id) {
            $('#product-select').append(new Option(self.DB.products[i].product_description, self.DB.products[i].product_id))
        }
        $('#product-select').attr('disabled', false).trigger('chosen:updated')
    }
}

TransfersClass.prototype.initialiazeVesselsSelect = function () {
    let self = this
    $('#vessel-select').empty()
    $('#vessel-select').append('<option></option>')
    for (i = 0; i < self.DB.vessels.length; i++) {
        $('#vessel-select').append(new Option(self.DB.vessels[i].vessel_description, self.DB.vessels[i].vessel_id))
    }
    $('#vessel-select').trigger('chosen:updated')
}

TransfersClass.prototype.initialiazeCitiesSelect = function () {
    let self = this
    $('#ex-input').empty()
    $('#to-input').empty()
    $('#ex-input').append('<option></option>')
    $('#to-input').append('<option></option>')
    for (i = 0; i < self.DB.cities.length; i++) {
        $('#ex-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
        $('#to-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    }
    $('#ex-input').trigger('chosen:updated')
    $('#to-input').trigger('chosen:updated')
}

TransfersClass.prototype.initialiazeServiceTypeSelect = function () {
    let self = this

    $('#service-type-select').empty()
    $('#service-type-select').append('<option></option>')
    for (i = 0; i < self.DB.individualServiceTypes.length; i++) {
        $('#service-type-select').append(new Option(self.DB.individualServiceTypes[i].service_type_description, self.DB.individualServiceTypes[i].service_type_id))
    }
    $('#service-type-select').trigger('chosen:updated')
}
