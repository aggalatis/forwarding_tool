let HelpersClass = function () {
    $.fn.modal.Constructor.prototype._enforceFocus = function () {}
    console.log('%c App Created by AG! Visit: aggalatis.com', 'background: #222; color: yellow')
    console.log('Constructing Helpers...')
    this.user_username = ''
    this.user_fullname = ''
    this.user_id = ''
    this.user_role_id = ''
}

HelpersClass.prototype.bindMovingEvents = function (elementID) {
    elementID = '#' + elementID
    $('.move-left').on('click', function () {
        if ($(elementID).hasClass('floatMeRight')) {
            $(elementID).removeClass('floatMeRight').addClass('noFloat')
        } else if ($(elementID).hasClass('noFloat')) {
            $(elementID).removeClass('noFloat').addClass('floatMeLeft')
        } else {
            $(elementID).addClass('floatMeLeft')
        }
    })

    $('.move-right').on('click', function () {
        if ($(elementID).hasClass('floatMeLeft')) {
            $(elementID).removeClass('floatMeLeft').addClass('noFloat')
        } else if ($(elementID).hasClass('noFloat')) {
            $(elementID).removeClass('noFloat').addClass('floatMeRight')
        } else {
            $(elementID).addClass('floatMeRight')
        }
    })
}
HelpersClass.prototype.toastr = function (type, message) {
    // notification popup
    toastr.options.closeButton = true
    toastr.options.positionClass = 'toast-top-right'
    toastr.options.showDuration = 1000
    toastr[type](message)
}

HelpersClass.prototype.handleLogout = function () {
    ipcRenderer.send('restart')
}

HelpersClass.prototype.saveUserData = function (userData) {
    let fs = require('fs')
    var userString = ''
    userString = userData.user_username + ';' + userData.user_fullname + ';' + userData.user_id + ';' + userData.user_role_id

    fs.writeFile('./usrdata.agcfg', userString, function (err) {
        if (err) throw err
    })
}

HelpersClass.prototype.initializeUser = function () {
    let self = this

    let fs = require('fs')
    console.log('Initialiazing User.....')
    var userFile = fs.readFileSync('./usrdata.agcfg', 'utf8')

    var userFileData = userFile.split(';')
    self.user_username = userFileData[0]
    self.user_fullname = userFileData[1]
    self.user_id = userFileData[2]
    self.user_role_id = userFileData[3]
    $('#span-username').html(userFileData[1])

    if (userFileData[3] != 1) {
        $('#statistics_list').attr('hidden', null)
        $('#deleted-ind').attr('hidden', null)
        $('#deleted-person').attr('hidden', null)
        $('#add_data_list').attr('hidden', null)
        $('#vessel-option').show()
    }
}

HelpersClass.prototype.initializeHelp = function () {
    let self = this

    $('#instrctions-div').hide()
    $('#visualizer-div').hide()
    $('#help-btn').on('click', function () {
        $('#help-modal').modal('show')
    })

    $('#help-instructions').on('click', function () {
        $('#instrctions-div').show(1000)
    })

    $('#help-visualizer').on('click', function () {
        $('#visualizer-div').show(1000)
    })
}

HelpersClass.prototype.getDateTimeNow = function () {
    var datetime = require('datetime-js')
    var dateObj = new Date()

    return datetime(dateObj, '%Y-%m-%d %H:%i:%s')
}

HelpersClass.prototype.changeDateToMysql = function (datetime) {
    var dateTimeArray = datetime.split('/')
    if (dateTimeArray.length == 3) {
        return dateTimeArray[2] + '-' + dateTimeArray[1] + '-' + dateTimeArray[0]
    } else {
        return datetime
    }
}

HelpersClass.prototype.changeMysqlDateToNormal = function (datetime) {
    var dateTimeArray = datetime.split(' ')
    let dateSplitted = dateTimeArray[0].split('-')
    return `${dateSplitted[2]}/${dateSplitted[1]}/${dateSplitted[0]} ${dateTimeArray[1]}`
}

HelpersClass.prototype.initliazeModalToEditJob = function (divisions, products, vessels, cities, serviceTypes, jobData) {
    let self = this
    console.log(jobData)
    myTransfers.initializeDivisionsSelect()
    self.findChoosenValueForDivision(divisions, jobData.division_description)
    myTransfers.initializeProductsSelect(divisions[i].division_id)
    self.findChoosenValueForProducts(products, jobData.ind_products)
    myTransfers.initialiazeVesselsSelect()
    self.findChoosenValueForVessels(vessels, jobData.ind_vessels)
    myTransfers.initialiazeCitiesSelect()
    self.findChoosenValueForCities(cities, jobData.ex_city, jobData.to_city)
    myTransfers.initialiazeServiceTypeSelect()
    self.findChoosenValueForServiceType(serviceTypes, jobData.service_type_description)

    $('#modal-title-text').html('Edit Job')
    $('#mode-select').val(jobData.ind_mode)
    $('#mode-select').trigger('chosen:updated')
    $('#deadline_date').val(jobData.ind_deadline)
    $('#forwarder').val(jobData.ind_forwarder)
    $('#reference').val(jobData.ind_reference)
    $('#kg').val(jobData.ind_kg)
    if (jobData.ind_kg == '0') {
        $('#kg').val('')
    } else {
        $('#kg').val(jobData.ind_kg)
    }

    if (jobData.ind_estimate_cost == '0') {
        $('#estimate_cost').val('')
    } else {
        $('#estimate_cost').val(jobData.ind_estimate_cost)
    }
    $('#notes').val(jobData.ind_notes)

    $('#save-job-btn').attr('disabled', null)
    $('#add-job-modal').modal('show')
}

HelpersClass.prototype.findChoosenValueForDivision = function (divisions, division_description) {
    let self = this

    for (i = 0; i < divisions.length; i++) {
        if (divisions[i].division_description == division_description) {
            $('#division-select').val(divisions[i].division_id)
            $('#division-select').trigger('chosen:updated')
            break
        }
    }
}

HelpersClass.prototype.findChoosenValueForServiceType = function (serviceTypes, service_type_description) {
    let self = this

    for (i = 0; i < serviceTypes.length; i++) {
        if (serviceTypes[i].service_type_description == service_type_description) {
            $('#service-type-select').val(serviceTypes[i].service_type_id)
            $('#service-type-select').trigger('chosen:updated')
            break
        }
    }
}

HelpersClass.prototype.findChoosenValueForProducts = function (products, product_names) {
    let self = this

    var productNames = product_names.split(';')
    var productIds = []
    for (i = 0; i < products.length; i++) {
        if (productNames.indexOf(products[i].product_description.toString()) !== -1) {
            productIds.push(products[i].product_id)
        }
    }
    $('#product-select').val(productIds)
    $('#product-select').trigger('chosen:updated')
}

HelpersClass.prototype.findChoosenValueForVessels = function (vessels, vessels_description) {
    let self = this

    var vesselNames = vessels_description.split(';')
    var vesselIds = []
    for (i = 0; i < vessels.length; i++) {
        if (vesselNames.indexOf(vessels[i].vessel_description.toString()) !== -1) {
            vesselIds.push(vessels[i].vessel_id)
        }
    }
    $('#vessel-select').val(vesselIds)
    $('#vessel-select').trigger('chosen:updated')
}

HelpersClass.prototype.findChoosenValueForCities = function (cities, ex_city, to_city) {
    let self = this
    for (i = 0; i < cities.length; i++) {
        if (cities[i].city_name == ex_city) {
            $('#ex-input').val(cities[i].city_id)
            $('#ex-input').trigger('chosen:updated')
        }
        if (cities[i].city_name == to_city) {
            $('#to-input').val(cities[i].city_id)
            $('#to-input').trigger('chosen:updated')
        }
    }
}
HelpersClass.prototype.formatFloatValue = function (num) {
    if (num.includes('.')) {
        var slpittedNum = num.split('.')

        if (slpittedNum[1].length > 1) {
            return num
        } else {
            return num + '0'
        }
    } else if (num !== '' && num !== 'null') {
        return num + '.00'
    } else {
        return 0
    }
}

HelpersClass.prototype.addCityAlert = function (myDB) {
    let self = this
    Swal.fire({
        title: 'Create a new city',
        input: 'text',
        inputLabel: 'Type a name for your city.',
        inputPlaceholder: 'City name',
        showCancelButton: true,
        showConfirmButton: true,
        inputValidator: value => {
            if (!value) {
                return 'Please type city name first..'
            }
        },
    }).then(cityObj => {
        if (cityObj.isConfirmed) {
            myDB.addCity(cityObj.value)
        }
    })
}

HelpersClass.prototype.checkIfUserHasPriviledges = function (jobUserName) {
    let self = this
    if (jobUserName == self.user_username || self.user_role_id == 2) {
        return true
    }
    return false
}

HelpersClass.prototype.jobsHaveSameDestination = function (jobsDestinations) {
    for (let i = 1; i < jobsDestinations.length; i++) if (jobsDestinations[i - 1] !== jobsDestinations[i]) return false

    return true
}
