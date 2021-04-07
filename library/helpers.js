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
        $('#add_data_list').attr('hidden', null)
        $('#vessel-option').show()

    }


}

HelpersClass.prototype.getDateTimeNow = function () {

    var datetime = require('datetime-js')
    var dateObj = new Date()

    return DateTime(dateObj, '%Y-%m-%d %H:%i:%s');

}

HelpersClass.prototype.changeDateToMysql = function (datetime) {


    var dateTimeArray = datetime.split('/')
    if (dateTimeArray.length == 3) {

        return dateTimeArray[2] + '-' + dateTimeArray[1] + '-' + dateTimeArray[0];

    } else {

        return datetime
    }


}

HelpersClass.prototype.initliazeModalToEditJob = function (divisions, ports, products, vessels, cities, jobData) {

    let self = this;

    myTransfers.initializeDivisionsSelect();
    self.findChoosenValueForDivision(divisions, jobData[2]);
    myTransfers.initializeProductsSelect(divisions[i].division_id)
    self.findChoosenValueForProducts(products, jobData[3]);
    myTransfers.initialiazeVesselsSelect();
    self.findChoosenValueForVessels(vessels, jobData[6]);
    myTransfers.initialiazeCitiesSelect();


    $('#modal-title-text').html('Edit Job')
    $('#mode-select').val(jobData[4])
    $('#mode-select').trigger("chosen:updated")
    $('#deadline_date').val(jobData[11])
    $('#cutoff_date').val(jobData[12])
    $('#scheldure_select').val(jobData[9])
    $('#scheldure_select').trigger("chosen:updated")
    $('#forwarder').val(jobData[14])
    $('#carrier').val(jobData[5])
    $('#estimate_cost').val(jobData[16])
    $('#notes').val(jobData[17])

    switch (jobData[4]) {
        case "Air": {
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()

            $('#ex-select-airport').val(jobData[7]).trigger("chosen:updated")
            $('#to-select-airport').val(jobData[8]).trigger("chosen:updated")

            $('#ex-select-airport-div').show();
            $('#to-select-airport-div').show();

            break;
        }
        case "Sea": {
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()

            $('#ex-select-port').val(jobData[7]).trigger("chosen:updated")
            $('#to-select-port').val(jobData[8]).trigger("chosen:updated")

            $('#ex-select-port-div').show();
            $('#to-select-port-div').show();

            break;
        }
        default:
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()

            $('#ex-input').val(jobData[7]).trigger("chosen:updated")
            $('#to-input').val(jobData[8]).trigger("chosen:updated")

            $('#to-input-div').show();
            $('#ex-input-div').show();
            break;


    }


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


    switch (jobData[4]) {
        case "Air": {
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()
            $('#to-input-div').hide()
            $('#ex-input-div').hide()

            $('#ex-select-airport').val(jobData[16]).trigger("chosen:updated")
            $('#to-select-airport').val(jobData[17]).trigger("chosen:updated")

            $('#ex-select-airport-div').show();
            $('#to-select-airport-div').show();

            break;
        }
        case "Sea": {
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()
            $('#to-input-div').hide()
            $('#ex-input-div').hide()

            $('#ex-select-port').val(jobData[16]).trigger("chosen:updated")
            $('#to-select-port').val(jobData[17]).trigger("chosen:updated")

            $('#ex-select-port-div').show();
            $('#to-select-port-div').show();

            break;
        }
        default:
            $('#ex-select-airport-div').hide()
            $('#to-select-airport-div').hide()
            $('#ex-select-port-div').hide()
            $('#to-select-port-div').hide()

            $('#ex-input').val(jobData[16]).trigger("chosen:updated")
            $('#to-input').val(jobData[17]).trigger("chosen:updated")

            $('#to-input-div').show();
            $('#ex-input-div').show();
            break;


    }


    $('#save-job-btn').attr('disabled', null)


    $('#add-consolidation-modal').modal('show')

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

HelpersClass.prototype.findChoosenValueForProducts = function (products, product_description) {
    let self = this;
    for (i = 0; i < products.length; i++) {

        if (products[i].product_description == product_description) {

            $('#product-select').val(products[i].product_id)
            $('#product-select').trigger("chosen:updated")
            break;
        }


    }


}

HelpersClass.prototype.findChoosenValueForVessels = function (vessels, vessels_description) {
    let self = this;

    for (i = 0; i < vessels.length; i++) {

        if (vessels[i].vessel_description == vessels_description) {

            $('#vessel-select').val(vessels[i].vessel_id)
            $('#vessel-select').trigger("chosen:updated")
            break;
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
            return 'You need to write something!'
        }
        }

    }).then((cityObj) => {
        myDB.addCity(cityObj.value)

    })
}