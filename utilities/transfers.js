let TransfersClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    // this.Helpers.initInstructionFiles(this.DB)
    this.Helpers.initGlobalSearch(this.DB)

    this.Helpers.initializeUser()
    this.Helpers.bindMovingEvents('help-modal-header')
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

    self.Helpers.initCurrencies(['currency', 'group-currency'])
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
        $('#pieces').val('')
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
        var groupCurrency = $('#group-currency').val()

        if (groupDeadline != '' && groupTo != '' && groupEx != '') {
            if (groupCost == '') {
                groupCost = null
                groupActive = 1
            } else {
                groupCost = groupCost / groupCurrency
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

    $('.deadline-info').on('click', function () {
        Swal.fire({
            title: 'Deadline info',
            text: 'This refers to the latest date that consignee requires shipment at destination for customs and further delivery.',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: false,
        })
        return
    })

    $('.mode-info').on('click', function () {
        Swal.fire({
            title: 'Mode info',
            text: 'Always check with consignee for recommended means of transport.',
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

    $('#currency').on('change', function () {
        let rate = $(this).val()
        rate = 1 / rate
        let currencyName = $('#currency option:selected').text()
        $('#estimate-cost-label').html(`Est. Cost (${currencyName})`)
        $('#estimate_cost_eur').attr('placeholder', `Rate to EUR: ${rate.toFixed(6)}`)
        let estimateCost = $('#estimate_cost').val()
        estimateCost == '' ? $('#estimate_cost_eur').val('') : $('#estimate_cost_eur').val(self.Helpers.applyRate(estimateCost, rate))
    })

    $('#group-currency').on('change', function () {
        let rate = $(this).val()
        rate = 1 / rate
        let currencyName = $('#group-currency option:selected').text()
        $('#group-cost-label').html(`Group Cost (${currencyName})`)
        $('#group_cost_eur').attr('placeholder', `Rate to EUR: ${rate.toFixed(6)}`)
        let groupCost = $('#group_cost').val()
        groupCost == '' ? $('#group_cost_eur').val('') : $('#group_cost_eur').val(self.Helpers.applyRate(groupCost, rate))
    })

    $('#estimate_cost').on('keyup', function () {
        $('#currency').trigger('change')
    })

    $('#group_cost').on('keyup', function () {
        $('#group-currency').trigger('change')
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
        var currency = $('#currency').val()
        var reference = $('#reference').val()
        var kg = self.Helpers.formatFloatValue($('#kg').val())
        var deadline = $('#deadline_date').val()
        let serviceType = $('#service-type-select').val()
        let pieces = self.Helpers.formatFloatValue($('#pieces').val())

        $(this).attr('disabled', 'disabled')
        if (
            deadline == '' ||
            modeSelectValue == '' ||
            divisionSelectValue == '' ||
            productSelectValue == '' ||
            vesselSelectValue == '' ||
            ind_ex == '' ||
            ind_to == ''
        ) {
            $(this).attr('disabled', null)
            self.Helpers.toastr('error', 'Some required fields are empty.')
            return
        }
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
            ind_estimate_cost: self.Helpers.applyRate(estimatecostSelectValue, currency),
            ind_group_id: 0,
            ind_reference: reference,
            ind_kg: kg,
            ind_service_type: serviceType == '' ? 0 : serviceType,
            ind_pieces: pieces,
        }
        console.log(individualData)
        self.DB.addIndividual(individualData)
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
        $('#service-type-select').append(
            new Option(self.DB.individualServiceTypes[i].service_type_description, self.DB.individualServiceTypes[i].service_type_id)
        )
    }
    $('#service-type-select').trigger('chosen:updated')
}
