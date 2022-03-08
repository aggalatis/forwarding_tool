let HelpersClass = function () {
    $.fn.modal.Constructor.prototype._enforceFocus = function () {}
    console.log('%c App Created by AG! Visit: aggalatis.com', 'background: #222; color: yellow')
    console.log('Constructing Helpers...')
    this.API_URL = 'https://api.portalx.eu'
    this.instructionFiles = []
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

    fs.writeFile('/home/aggalatis/Projects/forwarding_tool/usrdata.agcfg', userString, function (err) {
        if (err) throw err
    })
}

HelpersClass.prototype.initializeUser = function () {
    let self = this

    let fs = require('fs')
    console.log('Initialiazing User.....')
    var userFile = fs.readFileSync('/home/aggalatis/Projects/forwarding_tool/usrdata.agcfg', 'utf8')

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

    $('.help-scenario-link').on('click', function () {
        let scenarioID = $(this).data('id')
        let scenario = self.instructionFiles.find(el => el.id === scenarioID)
        window.open(scenario.url)
    })
    $('#help-instructions').on('click', function () {
        let instructions = self.instructionFiles.find(el => el.type === 'instructions')
        window.open(instructions.url)
    })

    $('#help-visualizer').on('click', function () {
        let visualizer = self.instructionFiles.find(el => el.type === 'visualizer')
        window.open(visualizer.url)
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
    $('#currency').val('1')
    $('#currency').trigger('chosen:updated')

    $('#modal-title-text').html('Edit Job')
    $('#mode-select').val(jobData.ind_mode)
    $('#mode-select').trigger('chosen:updated')
    $('#deadline_date').val(jobData.ind_deadline)
    $('#forwarder').val(jobData.ind_forwarder)
    $('#reference').val(jobData.ind_reference)
    $('#pieces').val(jobData.ind_pieces)
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
    if (num == null || num == '') return null
    return parseFloat(num.replace(',', '.')).toFixed(2)
    // if (num.includes('.')) {
    //     var slpittedNum = num.split('.')

    //     if (slpittedNum[1].length > 1) {
    //         return num
    //     } else {
    //         return num + '0'
    //     }
    // } else if (num !== '' && num !== 'null') {
    //     return num + '.00'
    // } else {
    //     return 0
    // }
}

HelpersClass.prototype.addCityAlert = function (myDB) {
    let self = this
    Swal.fire({
        title: 'CREATE NEW CITY',
        html: `
        <div class="form-group col-sm-12">
        <label>ADD YOUR CITY*</label>
        <input class="form-control" placeholder="Type city name..." id="city_name" />
    </div>
    <div class="form-group col-sm-12">
        <label>ADD YOUR ASSOCIATE/SUPPLIER/PORT</label>
        <input class="form-control" placeholder="Associate/Supplier/Port" id="city_associate" />
    </div>
        `,
        showCancelButton: true,
        showConfirmButton: true,
    }).then(response => {
        if (response.isConfirmed) {
            if ($('#city_name').val() == '') {
                self.toastr('error', 'Some required fields are empty.')
                return
            }
            let cityName = $('#city_name').val()
            if ($('#city_associate').val() != '') cityName += ` (${$('#city_associate').val()})`
            myDB.addCity(cityName)
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

HelpersClass.prototype.initInstructionFiles = async function (myDB) {
    let self = this

    const instFiles = await myDB.getInstructionFiles()
    this.instructionFiles = instFiles

    $('#append-scenarios').html()
    let appendStr = ''
    for (let instf of this.instructionFiles) {
        if (instf.type != 'scenario') continue
        appendStr += `<p class="help-text"><a href="#" class="help-scenario-link" data-id="${instf.id}" style="cursor: pointer">${instf.name}</a></p>`
    }
    $('#append-scenarios').html(appendStr)
    self.initializeHelp()
}

HelpersClass.prototype.initCurrencies = function (currencyInputs) {
    let self = this

    for (let currency of currencyInputs) {
        $(`#${currency}`).chosen()
        $(`#${currency}`).empty()
        $(`#${currency}`).append('<option></option>')
    }

    $.ajax({
        contentType: 'application/json',
        url: self.API_URL + '/Rates/GetRates',
        type: 'GET',
        success: function (response) {
            if (response.status !== 200) {
                for (let currency of currencyInputs) {
                    $(`#${currency}`).append(new Option('EUR', '1'))
                    $(`#${currency}`).trigger('chosen:updated')
                }
                return
            }
            for (let currency of currencyInputs) {
                for (let curr of response.data) $(`#${currency}`).append(new Option(curr.currency, curr.rate))
                $(`#${currency}`).trigger('chosen:updated')
            }
        },
        error: function (jqXHR, textStatus, error) {
            console.log('Request failed: ' + textStatus)
        },
    })

    // for (i = 0; i < self.DB.cities.length; i++) {
    //     $('#ex-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    //     $('#to-input').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    // }
    // $('#ex-input').trigger('chosen:updated')
    // $('#to-input').trigger('chosen:updated')
}

HelpersClass.prototype.initGlobalSearch = function (myDB) {
    let self = this
    $('#search-reference-btn').on('click', async function () {
        let reference = $('#global-search-reference').val()
        let individuals = await myDB.getIndividualsByReference(reference)
        let consoliadtions = await myDB.getConsolidationsByReference(reference)
        let doneCons = await myDB.getConsolidationDoneByReference(reference)
        $('#search-reslts-list').html('')
        let resultsHtml = ''
        for (let ind of individuals) resultsHtml += `<li>Ref: ${reference} found in Individals-${ind.ind_status} ex: ${ind.ind_ex} to: ${ind.ind_to} service:${ind.ind_service}</li>`
        $('#search-reslts-list').html(resultsHtml)
        console.log(individuals)
        console.log(consoliadtions)
        console.log(doneCons)
    })

    $('#global-search-modal-btn').on('click', function () {
        $('#global-search-modal').modal('show')
    })
    self.bindMovingEvents('global-search-modal-header')
}
