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
    this.LOCAL_SERVICE_TYPE_ID = 0
    this.LOCAL_SERVICE_TYPE_TEXT = ''
    this.LOCAL_SERVICE_FULL_TEXT = ''
    this.LOCAL_SERVICE_COLOR = ''
    this.GROUPED_TEXT = ''
    this.GROUPED_COLOR = ''
    this.INDIVIDUAL_TEXT = ''
    this.INDIVIDUAL_COLOR = ''
    this.PERSONNEL_TEXT = ''
    this.PERSONNEL_COLOR = ''
    this.initializeTypes()
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

    fs.writeFile('C:\\ForwardTool\\usrdata.agcfg', userString, function (err) {
        if (err) throw err
    })
}

HelpersClass.prototype.initializeUser = function () {
    let self = this

    let fs = require('fs')
    console.log('Initialiazing User.....')
    var userFile = fs.readFileSync('C:\\ForwardTool\\usrdata.agcfg', 'utf8')

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

HelpersClass.prototype.initializeTypes = function () {
    let self = this

    let fs = require('fs')
    console.log('Initialiazing Types Text.....')
    var typesFile = fs.readFileSync('C:\\ForwardTool\\types.agcfg', 'utf8')

    let typesLines = typesFile.split('\n')
    self.LOCAL_SERVICE_TYPE_ID = typesLines[0].split(';')[0]
    self.LOCAL_SERVICE_TYPE_TEXT = typesLines[0].split(';')[1]
    self.LOCAL_SERVICE_FULL_TEXT = typesLines[0].split(';')[1]
    self.LOCAL_SERVICE_COLOR = typesLines[0].split(';')[2]

    self.GROUPED_TEXT = typesLines[1].split(';')[1]
    self.GROUPED_COLOR = typesLines[1].split(';')[2]

    self.INDIVIDUAL_TEXT = typesLines[2].split(';')[1]
    self.INDIVIDUAL_COLOR = typesLines[2].split(';')[2]

    self.PERSONNEL_TEXT = typesLines[3].split(';')[1]
    self.PERSONNEL_COLOR = typesLines[3].split(';')[2]
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
    let dateTimeArray = datetime.split(' ')
    let dateSplitted = dateTimeArray[0].split('-')
    let stringdate = `${dateSplitted[2]}/${dateSplitted[1]}/${dateSplitted[0]}`
    if (dateTimeArray.length != 2) return stringdate
    return `${stringdate} ${dateTimeArray[1]}`
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
    if (jobData.ind_estimate_cost == '0') {
        $('#estimate_cost').val('')
    } else {
        $('#estimate_cost').val(self.revertRate(jobData.ind_estimate_cost, jobData.ind_rate))
    }

    self.initCurrencyInput(jobData.ind_currency)

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
    if (product_names == null) return ''
    var productNames = product_names.split(';')
    var productIds = []
    for (i = 0; i < products.length; i++) {
        if (productNames.indexOf(products[i].product_description.toString()) !== -1) {
            productIds.push(products[i].product_id)
        }
    }
    console.log(productIds)
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
    if (typeof num == 'string') {
        return parseFloat(num.replace(',', '.')).toFixed(2)
    }
    return num.toFixed(2)
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
    <div class="form-group col-sm-12">
        <p>eg: Shanghai (OMS)</p>
        <p>&nbsp; &nbsp; &nbsp; Shanghai (Port)</p>
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
                $(`#${currency}`).val('1')
                $(`#${currency}`).trigger('chosen:updated')
            }
        },
        error: function (jqXHR, textStatus, error) {
            console.log('Request failed: ' + error)
            for (let currency of currencyInputs) {
                $(`#${currency}`).append(new Option('EUR', '1'))
                $(`#${currency}`).trigger('chosen:updated')
            }
        },
    })
}

HelpersClass.prototype.initGlobalSearch = function (myDB) {
    let self = this
    $('#search-reference-btn').on('click', async function () {
        $('#global-search-results').show()
        let reference = $('#global-search-reference').val()
        let individuals = await myDB.getIndividualsByReference(reference)
        let consoliadtions = await myDB.getConsolidationsByReference(reference)
        let doneCons = await myDB.getConsolidationDoneByReference(reference)
        $('#search-reslts-list').html('')
        let resultsHtml = ''
        for (let ind of individuals)
            resultsHtml += `<li style="color: black; font-size: 15px">Ref: <span style="color: red">"${self.validOutput(
                ind.ind_reference
            )}"</span> found in <span style="color: red">Individals-${ind.ind_status} ID: ${ind.ind_id}</span> EX: <span style="color: red">${
                ind.ex_city
            }</span> TO: <span style="color: red">${self.validOutput(ind.to_city)}</span> SERVICE: <span style="color: red">${self.validOutput(
                ind.service_name
            )}</span> DEADLINE: <span style="color: red">${self.changeMysqlDateToNormal(self.validOutput(ind.ind_deadline))}</span></li>`
        for (let con of consoliadtions)
            resultsHtml += `<li style="color: black; font-size: 15px">Ref: <span style="color: red">"${self.validOutput(
                con.con_reference
            )}"</span> found in <span style="color: red">Consolidations-Pending ID: ${
                con.con_group_id
            }</span> EX: <span style="color: red">${self.validOutput(con.ex_city)}</span> TO: <span style="color: red">${self.validOutput(
                con.to_city
            )}</span> SERVICE: <span style="color: red">${self.validOutput(
                con.service_name
            )}</span> DEADLINE: <span style="color: red">${self.validOutput(con.group_deadline)}</span></li>`
        for (let cond of doneCons) {
            if (cond.cond_delivered_on_board == null || cond.cond_delivered_on_board == '') {
                resultsHtml += `<li style="color: black; font-size: 15px">Ref: <span style="color: red">"${
                    cond.cond_reference
                }"</span> found in <span style="color: red">Consolidations-Done ID: ${
                    cond.cond_group_id
                }</span> EX: <span style="color: red">${self.validOutput(cond.ex_city)}</span> TO: <span style="color: red">${self.validOutput(
                    cond.to_city
                )}</span> SERVICE: <span style="color: red">${self.validOutput(
                    cond.service_name
                )}</span> DEADLINE: <span style="color: red">${self.validOutput(cond.group_deadline)}</span></li>`
            } else {
                resultsHtml += `<li style="color: black; font-size: 15px">Ref: <span style="color: red">"${
                    cond.cond_reference
                }"</span> found in <span style="color: red">Consolidations-Done ID: ${
                    cond.cond_group_id
                }</span> SERVICE: <span style="color: red">${self.validOutput(
                    cond.service_name
                )}</span> was delivered on board with DEADLINE: <span style="color: red">${self.validOutput(cond.group_deadline)}</span></li>`
            }
        }

        $('#search-reslts-list').html(resultsHtml)
    })

    $('#global-search-modal-btn').on('click', function () {
        $('#global-search-results').val('')
        $('#search-reslts-list').html('')
        $('#global-search-modal').modal('show')
    })
    self.bindMovingEvents('global-search-modal-header')
}

HelpersClass.prototype.individualDataAreEmpty = function (indData, allowTBA = false) {
    let self = this
    if (
        indData.division_description == '' ||
        indData.division_description == null ||
        indData.ex_city == '' ||
        indData.ex_city == null ||
        indData.ind_deadline == '' ||
        indData.ind_deadline == null ||
        indData.ind_estimate_cost == '' ||
        indData.ind_estimate_cost == null ||
        indData.ind_forwarder == '' ||
        indData.ind_forwarder == null ||
        indData.ind_kg == '' ||
        indData.ind_kg == null ||
        indData.ind_mode == '' ||
        indData.ind_mode == null ||
        indData.ind_pieces == '' ||
        indData.ind_pieces == null ||
        indData.ind_products == '' ||
        indData.ind_products == null ||
        indData.ind_reference == '' ||
        indData.ind_reference == null ||
        indData.ind_vessels == '' ||
        indData.ind_vessels == null ||
        indData.to_city == '' ||
        indData.to_city == null ||
        indData.service_type_description == '' ||
        indData.service_type_description == null ||
        indData.sum_estimated_cost == null ||
        indData.sum_estimated_cost == ''
    )
        return true
    if (indData.ind_mode == self.PERSONNEL_TEXT && indData.ind_actual_cost == null) return true
    if (indData.ind_deadline == 'TBA' && allowTBA == false) return true
    return false
}

HelpersClass.prototype.groupDataAreEmpty = function (groupData) {
    if (
        groupData.ind_group_deadline == '' ||
        groupData.ind_group_deadline == null ||
        groupData.ind_group_cost == '' ||
        groupData.ind_group_cost == null ||
        groupData.ind_group_forwarder == '' ||
        groupData.ind_group_forwarder == null
    )
        return true
    return false
}

HelpersClass.prototype.validOutput = function (field) {
    if (typeof field == 'undefined' || field == null) return '-'
    return field
}

HelpersClass.prototype.applyRate = function (value, rate) {
    return rate == '' ? this.formatFloatValue(value) : this.formatFloatValue(value * rate)
}

HelpersClass.prototype.revertRate = function (value, rate) {
    return rate == '' ? this.formatFloatValue(value) : this.formatFloatValue(value / rate)
}

HelpersClass.prototype.swalUserPermissionError = function () {
    Swal.fire({
        title: 'Unable to access this job.',
        text: "Unfortunately this is a job inserted by different user. You can't access it.",
        icon: 'error',
        showCancelButton: true,
        showConfirmButton: false,
    })
}

HelpersClass.prototype.swalFieldsMissingError = function () {
    Swal.fire({
        title: 'Unable to proceed.',
        text: 'Unfortunately some mandatory fields are missing.',
        icon: 'error',
        showCancelButton: true,
        showConfirmButton: false,
    })
}

HelpersClass.prototype.initCurrencyInput = function (curr, currInput = 'currency') {
    $(`#${currInput} option`).each(function () {
        $(this).attr('selected', false)
        if ($(this).text() == curr) {
            $(this).attr('selected', 'selected')
        }
    })
    $(`#${currInput}`).trigger('chosen:updated')
    $(`#${currInput}`).trigger('change')
}

HelpersClass.prototype.initCurrencyInfo = function () {
    $('.currency-info').on('click', function () {
        Swal.fire({
            title: 'Rate info',
            text: `Currency rate should be used for estimate use only not for invoicing purposes.`,
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: false,
        })
        return
    })
}

HelpersClass.prototype.bindCloseBtnsAlerts = function () {
    let self = this

    $('.close-btn').on('click', function () {
        let modalId = $(this).data('modal-referer')
        Swal.fire({
            title: 'Close Window?',
            text: `Are you sure you want to close this window? Changes made will not be saved.`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                $(`#${modalId}`).modal('hide')
            }
        })
        return
    })
}

HelpersClass.prototype.jobHasMultiVessels = function (job) {
    if (job.ind_vessels.indexOf(';') != -1) return true
    return false
}

HelpersClass.prototype.changeProductIdstoString = function (selectedProducts, myDB) {
    let productsNames = []
    for (i = 0; i < myDB.products.length; i++) {
        if (selectedProducts.indexOf(myDB.products[i].product_id.toString()) !== -1) {
            //this means i found the product
            productsNames.push(myDB.products[i].product_description)
        }
    }
    return productsNames.join(';')
}
