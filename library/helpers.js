let HelpersClass = function () {

    $.fn.modal.Constructor.prototype._enforceFocus = function() {};
    this.username = '';
    this.user_fullname = '';
    this.use_role_id = '';


}


HelpersClass.prototype.bindMovingEvents = function(elementID) {

    elementID = '#' + elementID
    $('.move-left').on('click', function() {

        if ($(elementID).hasClass('floatMeRight')) {

            $(elementID).removeClass('floatMeRight').addClass('noFloat')
        } else if ($(elementID).hasClass('noFloat')) {

            $(elementID).removeClass('noFloat').addClass('floatMeLeft')

        } else {

            $(elementID).addClass('floatMeLeft')
        }

    })

    $('.move-right').on('click', function() {

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
    toastr.options.closeButton = true;
    toastr.options.positionClass = 'toast-top-right';
    toastr.options.showDuration = 1000;
    toastr[type](message);

}

HelpersClass.prototype.handleLogout = function () {


    ipcRenderer.send('restart')

}

HelpersClass.prototype.saveUserData = function (userData) {


    let fs = require('fs')
    var userString = "";

    userString = userData.user_username + ';' + userData.user_fullname + ';' + userData.user_id + ';' + userData.user_role_id;

    fs.writeFile("C:\\ForwardTool\\usrdata.agcfg", userString, function (err) {

        if (err) throw err
    })


}

HelpersClass.prototype.initializeUser = function () {

    let self = this;

    let fs = require('fs')

    var userFile = fs.readFileSync("C:\\ForwardTool\\usrdata.agcfg", 'utf8')

    var userFileData = userFile.split(';')
    self.user_username = userFileData[0];
    self.user_fullname = userFileData[1];
    self.user_id = userFileData[2];
    self.use_role_id = userFileData[3];

    $('#span-username').html(userFileData[1])

    if (userFileData[3] != 1) {

        $('#statistics_list').attr('hidden', null)
        $('#deleted-ind').attr('hidden', null)
        $('#deleted-person').attr('hidden', null)
        $('#add_data_list').attr('hidden', null)
        $('#vessel-option').show()

    }


}

HelpersClass.prototype.getDateTimeNow = function () {

    var datetime = require('datetime-js')
    var dateObj = new Date()

    return datetime(dateObj, '%Y-%m-%d %H:%i:%s');

}

HelpersClass.prototype.changeDateToMysql = function (datetime) {


    var dateTimeArray = datetime.split('/')
    if (dateTimeArray.length == 3) {

        return dateTimeArray[2] + '-' + dateTimeArray[1] + '-' + dateTimeArray[0];

    } else {

        return datetime
    }


}

HelpersClass.prototype.initliazeModalToEditJob = function (divisions, products, vessels, cities, jobData) {

    let self = this;
    myTransfers.initializeDivisionsSelect();
    self.findChoosenValueForDivision(divisions, jobData[2]);
    myTransfers.initializeProductsSelect(divisions[i].division_id)
    self.findChoosenValueForProducts(products, jobData[3]);
    myTransfers.initialiazeVesselsSelect();
    self.findChoosenValueForVessels(vessels, jobData[5]);
    myTransfers.initialiazeCitiesSelect();
    self.findChoosenValueForCities(cities, jobData[6], jobData[7])

    $('#modal-title-text').html('Edit Job')
    $('#mode-select').val(jobData[4])
    $('#mode-select').trigger("chosen:updated")
    $('#deadline_date').val(jobData[8])
    $('#forwarder').val(jobData[10])
    $('#reference').val(jobData[11])
    $('#kg').val(jobData[12])
    $('#estimate_cost').val(jobData[13])
    $('#notes').val(jobData[14])

    $('#save-job-btn').attr('disabled', null)
    $('#add-job-modal').modal('show')

}

HelpersClass.prototype.initliazeModalToEditConsolidation = function (divisions, ports, products, vessels, cities, jobData) {

    let self = this;

    myConsolidations.initializeDivisionsSelect();
    self.findChoosenValueForDivision(divisions, jobData[2]);
    myConsolidations.initializeProductsSelect(divisions[i].division_id)
    self.findChoosenValueForProducts(products, jobData[3]);
    myConsolidations.initialiazeVesselsSelect();
    self.findChoosenValueForVessels(vessels, jobData[15]);
    myConsolidations.initialiazeCitiesSelect();


    $('#modal-title-text').html('Edit Consolidation')
    $('#mode-select').val(jobData[4])
    $('#mode-select').trigger("chosen:updated")
    $('#deadline_date').val(jobData[19])
    $('#cutoff_date').val(jobData[20])
    $('#forwarder').val(jobData[22])
    $('#carrier').val(jobData[5])
    $('#notes').val(jobData[23])
    $('#reference').val(jobData[6])
    $('#actual_weight').val(jobData[7])
    $('#length').val(jobData[8])
    $('#width').val(jobData[9])
    $('#height').val(jobData[10])
    $('#pieces').val(jobData[11])
    $('#volume_weight').val(jobData[12])

    $('#ex-input').val(jobData[16]).trigger("chosen:updated")
    $('#to-input').val(jobData[17]).trigger("chosen:updated")


    $('#save-job-btn').attr('disabled', null)


    $('#add-consolidation-modal').modal('show')

}

HelpersClass.prototype.initliazeModalToEditPersonnel = function (divisions, products, vessels, cities, jobData) {

    let self = this;
    myPersonnel.initializeDivisionsSelect();
    self.findChoosenValueForDivision(divisions, jobData[2]);
    myPersonnel.initializeProductsSelect(divisions[i].division_id)
    self.findChoosenValueForProducts(products, jobData[3]);
    myPersonnel.initialiazeVesselsSelect();
    self.findChoosenValueForVessels(vessels, jobData[6]);
    myPersonnel.initialiazeCitiesSelect();
    self.findChoosenValueForCities(cities, jobData[7], jobData[8])

    $('#modal-title-text').html('Edit Personnel')
    $('#mode-select').val(jobData[4])
    $('#mode-select').trigger("chosen:updated")
    $('#deadline_date').val(jobData[9])
    $('#name').val(jobData[5])
    $('#kg').val(jobData[11])
    $('#estimate_cost').val(jobData[12])
    $('#actual_cost').val(jobData[13])
    $('#saving').val(jobData[14])
    $('#notes').val(jobData[15])

    $('#save-per-btn').attr('disabled', null)
    $('#add-per-modal').modal('show')

}

HelpersClass.prototype.findChoosenValueForDivision = function (divisions, division_description) {
    let self = this;

    for (i = 0; i < divisions.length; i++) {

        if (divisions[i].division_description == division_description) {

            $('#division-select').val(divisions[i].division_id)
            $('#division-select').trigger("chosen:updated")
            break;
        }


    }


}

HelpersClass.prototype.findChoosenValueForProducts = function (products, product_names) {
    let self = this;

    var productNames = product_names.split(";")
    var productIds = []
    for (i = 0; i < products.length; i++) {
        if (productNames.indexOf(products[i].product_description.toString()) !== -1) {
            productIds.push(products[i].product_id)
        }


    }
    $('#product-select').val(productIds)
    $('#product-select').trigger("chosen:updated")


}

HelpersClass.prototype.findChoosenValueForVessels = function (vessels, vessels_description) {
    let self = this;

    var vesselNames = vessels_description.split(";")
    var vesselIds = []
    for (i = 0; i < vessels.length; i++) {
        if (vesselNames.indexOf(vessels[i].vessel_description.toString()) !== -1) {
            vesselIds.push(vessels[i].vessel_id)
        }


    }
    $('#vessel-select').val(vesselIds)
    $('#vessel-select').trigger("chosen:updated")


}

HelpersClass.prototype.findChoosenValueForCities = function (cities, ex_city, to_city) {
    let self = this;
    for (i = 0; i < cities.length; i++) {

        if (cities[i].city_name == ex_city) {
            $('#ex-input').val(cities[i].city_id)
            $('#ex-input').trigger("chosen:updated")
        }
        if (cities[i].city_name == to_city) {
            $('#to-input').val(cities[i].city_id)
            $('#to-input').trigger("chosen:updated")
        }


    }

}
HelpersClass.prototype.formatFloatValue = function (num) {


    if (num.includes('.')) {

        var slpittedNum = num.split(".")

        if (slpittedNum[1].length > 1) {

            return num;
        } else {

            return num + "0";
        }


    } else if (num !== '' && num !== 'null') {


        return num + ".00"
    } else {
        return null;
    }


}

HelpersClass.prototype.addCityAlert = function (myDB) {

    let self = this;
    Swal.fire({
        title: 'Create a new city',
        input: 'text',
        inputLabel: 'Type a name for your city.',
        inputPlaceholder: "City name",
        showCancelButton: true,
        showConfirmButton: true,
        inputValidator: (value) => {
        if (!value) {
            return 'Please type city name first..'
        }
        }

    }).then((cityObj) => {
        if (cityObj.isConfirmed) {
            myDB.addCity(cityObj.value)
        }


    })
}