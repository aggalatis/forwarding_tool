let ConsolidationsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initInstructionFiles(this.DB)
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.bindMovingEvents('help-modal-header')
    this.Helpers.bindMovingEvents('cost-modal-header')
    this.Helpers.initializeUser()
    this.Helpers.initCurrencies(['currency'])
    this.bindEventsOnButtons()
    this.DB.getAllCities()
    this.DB.getAllServiceTypes()
    let self = this
    setTimeout(function () {
        self.initializetable()
        self.initialiazeCitiesSelect()
        self.initializeServiceTypeSelect()
    }, 1000)
}

ConsolidationsClass.prototype.initializetable = async function () {
    let self = this

    const consolidations = await self.DB.getAllConsolidations()

    let tableData = self.formatData(consolidations)
    let consolidationsTable = $('#consolidations_table').DataTable({
        data: tableData,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: 'ID', orderable: false, data: 'con_id', visible: false },
            { title: 'JOB ID', orderable: false, data: 'con_ind_id', visible: true },
            { title: 'CONSOLIDATION ID', orderable: false, data: 'group_id' },
            { title: 'REQ. DATE', orderable: false, data: 'con_request_date' },
            { title: 'USER', orderable: false, data: 'user_username' },
            { title: 'DEPARTMENT', orderable: false, data: 'division_description' },
            {
                title: 'TYPE',
                orderable: false,
                data: 'con_type',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.con_type == 'Individual') {
                        $(td).css('color', 'blue').css('font-weight', 'bold')
                    }
                    if (rowData.con_type == 'Grouped') {
                        $(td).css('color', '#32CD32').css('font-weight', 'bold')
                    }
                    if (rowData.con_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) {
                        $(td).css('color', 'red').css('font-weight', 'bold')
                    }
                },
            },
            { title: 'PRODUCTS', orderable: false, data: 'con_products' },
            { title: 'MODE', orderable: false, data: 'con_group_mode' },
            {
                title: 'SERVICE',
                orderable: false,
                data: 'service_type_description',
            },
            { title: 'VESSELS', orderable: false, data: 'con_vessels' },
            {
                title: 'EX',
                orderable: false,
                className: 'danger-header',
                data: 'ex_name',
            },
            {
                title: 'TO',
                orderable: false,
                className: 'danger-header',
                data: 'to_name',
            },
            {
                title: 'DEADLINE',
                orderable: false,
                className: 'danger-header',
                data: 'con_group_deadline',
            },
            { title: 'FORWARDER', orderable: false, data: 'con_group_forwarder' },
            { title: 'REFERENCE', orderable: false, data: 'con_reference' },
            { title: 'CONSOL. COST (€)', visible: false, data: 'con_group_cost' },
            { title: 'CONSOL. COST (€)', visible: true, data: 'visible_consolidation_cost' },
            { title: 'PIECES', orderable: false, data: 'con_pieces' },
            { title: 'WEIGHT (KG)', orderable: false, data: 'con_kg' },
            { title: 'COST / KG (€)', orderable: false, data: 'con_cost_per_kg' },
            { title: 'SHARED CONS COST (€)', visible: true, data: 'con_shared_cost' },
            {
                title: 'ACTIONS',
                orderable: false,
                defaultContent:
                    "<i class='fa fa-check confirm-job action-btn' title='confirm' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' title='costs' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' title='delete' style='cursor: pointer' ></i>",
            },
        ],
        rowCallback: function (row, data, index, cells) {
            //Here I am changing background Color
            $('td', row).css('background-color', data.con_group_color)
        },
        order: [[2, 'desc']],
        pageLength: 25,
    })
    $('#consolidations_table').on('click', 'i.delete-job', function () {
        var data = consolidationsTable.row($(this).closest('tr')).data()
        console.log(data)
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        Swal.fire({
            title: 'Delete Job?',
            text: "Are you sure you want to delete this job? You won't be able to revert it!",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.deleteConsolidation(data)
                self.Helpers.toastr('success', 'Group is deleted successfully!')
                self.refreshTable()
            }
        })
    })
    $('#consolidations_table').on('click', 'i.confirm-job', function () {
        var data = consolidationsTable.row($(this).closest('tr')).data()
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        if (!self.validGroupData(consolidationsTable.rows().data(), data.con_group_id)) {
            self.Helpers.swalFieldsMissingError()
            return
        }
        Swal.fire({
            title: 'Confirm Group?',
            text: "Are you sure you want to confirm this group? You won't be able to revert it!",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.confirmConsGroup(data)
                self.Helpers.toastr('success', 'Job is confirmed successfully!')
                self.refreshTable()
            }
        })
    })
    $('#consolidations_table').on('click', 'i.costs-job', function () {
        $('#total-savings-div').hide()
        var data = consolidationsTable.row($(this).closest('tr')).data()
        self.selectedGroupID = data.group_id
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            self.Helpers.swalUserPermissionError()
            return
        }
        let groupJobs = []
        const tableData = consolidationsTable.rows().data()
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].group_id == self.selectedGroupID) groupJobs.push(tableData[i])
        }
        let foundGroupedJobs = groupJobs.find(el => el.con_type == 'Grouped')
        let foundIndividualJobs = groupJobs.find(el => el.con_type == 'Individual')
        let foundLocalJobs = groupJobs.find(el => el.con_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT)
        $('#group-savings').val('')
        $('#grouped-jobs-cost').hide()
        $('#individual-jobs-cost').hide()
        $('#local-jobs-costs').hide()
        $('#calculate-group-savings').hide()

        if (typeof foundLocalJobs != 'undefined') {
            $('#local-jobs-costs').show()
            $('#locals-cost').val(self.Helpers.revertRate(data.con_group_local_cost, data.con_group_rate))
        }
        if (typeof foundGroupedJobs != 'undefined') {
            $('#grouped-jobs-cost').show()
            $('#calculate-group-savings').show()
            $('#append-grouped-estimate-cost').html('')
            $('#group-cost').val(self.Helpers.revertRate(data.con_group_cost, data.con_group_rate))
            let divString = ''
            for (let job of groupJobs) {
                if (job.con_type == 'Grouped') {
                    divString += `<div class="col-6"><div class="form-group"><label class="bold-label currency-label"> Job ${job.con_ind_id} | Ref: ${
                        job.con_reference
                    } (EUR)</label><input class="form-control currency-input grouped-estimate-cost-input" data-id="${
                        job.con_id
                    }" data-trigger-flag="group-trigg-${
                        job.con_ind_id
                    }" placeholder="Type Cost in EUR..." type="number" value="${self.Helpers.revertRate(
                        job.con_estimate_cost,
                        job.con_group_rate
                    )}"/></div></div>`
                    divString += `<div class="col-6"><div class="form-group"><label class="bold-label"> Job ${job.con_ind_id} | Ref: ${job.con_reference} (EUR)</label><input class="form-control currency-slave" data-id="${job.con_id}" data-trigger-flag="group-trigg-${job.con_ind_id}" placeholder="Type Cost in EUR..." type="text" disabled/></div></div>`
                }
            }
            $('#append-grouped-estimate-cost').html(divString)
            self.calculateGroupSavings()
        }

        if (typeof foundIndividualJobs != 'undefined') {
            $('#individual-jobs-cost').show()
            $('#append-individual-cost').html('')
            let divString = ''
            for (let job of groupJobs) {
                if (job.con_type == 'Individual') {
                    divString += `<div class="col-6"><div class="form-group"><label class="bold-label currency-label"> Job ${job.con_ind_id} | Ref: ${
                        job.con_reference
                    } (EUR)</label><input class="form-control currency-input individual-estimate-cost-input" data-id="${
                        job.con_id
                    }" data-trigger-flag="ind-trigg-${
                        job.con_ind_id
                    }" placeholder="Type Cost in EUR..." type="number" value="${self.Helpers.revertRate(
                        job.con_estimate_cost,
                        job.con_group_rate
                    )}"/></div></div>`
                    divString += `<div class="col-6"><div class="form-group"><label class="bold-label"> Job ${job.con_ind_id} | Ref: ${job.con_reference} (EUR)</label><input class="form-control currency-slave" data-id="${job.con_id}" data-trigger-flag="ind-trigg-${job.con_ind_id}" placeholder="Type Cost in EUR..." type="text" disabled/></div></div>`
                }
            }
            $('#append-individual-cost').html(divString)
        }

        self.Helpers.initCurrencyInput(data.con_group_currency)

        self.rebindEventsOnCurrencies()
        self.findChoosenValueForCities(data.ex_name, data.to_name)
        self.Helpers.findChoosenValueForServiceType(self.DB.consolidationServiceTypes, data.service_type_description)

        $('#group-mode-select').val(data.con_group_mode)
        $('#group-mode-select').trigger('chosen:updated')
        $('#group-forwarder').val(data.con_group_forwarder)
        $('#group-deadline').val(data.con_group_deadline)
        $('#group-modal').modal('show')
        $('#save-group-data').attr('disabled', null)
    })

    $('#search_datatable').keyup(function () {
        consolidationsTable.search('^' + $(this).val()).draw()
        if ($(this).val() != '') {
            let regexp = `\\b${$(this).val()}`
            consolidationsTable.search(regexp, true, false).draw()
        } else {
            consolidationsTable.search('').draw()
        }
    })
}

ConsolidationsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#group-mode-select').chosen()
    $('#group-ex-select').chosen()
    $('#group-to-select').chosen()
    $('#service-type-select').chosen()

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#save-group-data').on('click', async function () {
        $(this).attr('disabled', 'disabled')
        $('#cacalculate-group-savings').trigger('click')
        let rate = $('#currency_rate').val()
        let groupData = {
            groupId: self.selectedGroupID,
            groupMode: $('#group-mode-select').val(),
            groupForwarder: $('#group-forwarder').val(),
            groupEx: $('#group-ex-select').val(),
            groupTo: $('#group-to-select').val(),
            groupCost: self.Helpers.applyRate($('#group-cost').val(), rate),
            groupDeadline: $('#group-deadline').val(),
            groupServiceType: $('#service-type-select').val(),
            groupLocalCost: self.Helpers.applyRate($('#locals-cost').val(), rate),
            groupCurrency: $('#currency option:selected').text(),
            groupRate: 1 / $('#currency').val(),
        }
        let updateData = await self.DB.updateConGroupData(groupData)

        $('.grouped-estimate-cost-input').each(function () {
            self.DB.updateConsolidationCost({ id: $(this).data('id'), cost: self.Helpers.applyRate($(this).val(), rate) })
        })
        $('.individual-estimate-cost-input').each(function () {
            self.DB.updateConsolidationCost({ id: $(this).data('id'), cost: self.Helpers.applyRate($(this).val(), rate) })
        })
        if (updateData && updateData.affectedRows == 1) {
            self.Helpers.toastr('success', 'Consolidation updated!')
            $('#group-modal').modal('hide')
            self.refreshTable()
        }
    })

    $('.deadline-info').on('click', function () {
        Swal.fire({
            title: 'Deadline info',
            text: 'This refers to the berthing date of the vessel.',
            icon: 'warning',
            showCancelButton: true,
            showConfirmButton: false,
        })
        return
    })

    $('#currency').on('change', function () {
        let rate = 1 / $(this).val()
        let currencyName = $('#currency option:selected').text()
        $('#currency_rate').val(rate)
        $('.currency-input').attr('placeholder', `Type Cost in ${currencyName}...`)
        $('.currency-input').each(function () {
            self.handleCurrencyInputChange($(this))
        })
        $('.currency-label').each(function () {
            let currencyLabel = $(this).html()
            currencyLabel = currencyLabel.slice(0, -5)
            currencyLabel = currencyLabel + `(${currencyName})`
            $(this).html(currencyLabel)
        })
    })

    $('.currency-input').on('change keyup', function () {
        self.handleCurrencyInputChange($(this))
    })

    $('#calculate-group-savings').on('click', function () {
        $('#total-savings-div').show()
        self.calculateGroupSavings()
    })
}

ConsolidationsClass.prototype.bindSaveEventOnSaveJobButton = function () {
    let self = this
    $('#save-job-btn').unbind('click')

    $('#save-job-btn').on('click', function () {
        var modeSelectValue = $('#mode-select').val()
        var divisionSelectValue = $('#division-select').val()
        var productSelectValue = $('#product-select').val()
        var vesselSelectValue = $('#vessel-select').val()
        var actualWeight = $('#actual_weight').val()
        var volumeWeight = $('#volume_weight').val()
        var cutoffDate = $('#cutoff_date').val()
        var deadlinedate = $('#deadline_date').val()
        var reference = $('#reference').val()

        if (
            modeSelectValue != '' &&
            divisionSelectValue != '' &&
            productSelectValue != '' &&
            vesselSelectValue != '' &&
            actualWeight != '' &&
            volumeWeight != '' &&
            cutoffDate != '' &&
            deadlinedate != '' &&
            reference != ''
        ) {
            $(this).attr('disabled', 'disabled')
            var ind_ex = ''
            var ind_to = ''
            if (modeSelectValue == 'Air') {
                ind_ex = $('#ex-select-airport').val()
                ind_to = $('#to-select-airport').val()
            } else if (modeSelectValue == 'Sea') {
                ind_ex = $('#ex-select-port').val()
                ind_to = $('#to-select-port').val()
            } else {
                ind_ex = $('#ex-input').val()
                ind_to = $('#to-input').val()
            }

            if (ind_ex != '' && ind_to != '') {
                var consolidationData = {
                    con_user_id: self.Helpers.user_id,
                    con_division_id: divisionSelectValue,
                    con_product_id: productSelectValue,
                    con_mode: modeSelectValue,
                    con_reference: reference,
                    con_actual_weight: actualWeight,
                    con_length: $('#length').val() == '' ? 0 : $('#length').val(),
                    con_width: $('#width').val() == '' ? 0 : $('#width').val(),
                    con_height: $('#height').val() == '' ? 0 : $('#height').val(),
                    con_pieces: $('#pieces').val() == '' ? 0 : $('#pieces').val(),
                    con_volume_weight: volumeWeight,
                    con_chargable_weight: volumeWeight > actualWeight ? volumeWeight : actualWeight,
                    con_vessel_id: vesselSelectValue,
                    con_ex: ind_ex,
                    con_to: ind_to,
                    con_request_date: self.Helpers.getDateTimeNow(),
                    con_deadline: self.Helpers.changeDateToMysql($('#deadline_date').val()),
                    con_cut_off_date: self.Helpers.changeDateToMysql($('#cutoff_date').val()),
                    con_notes: $('#notes').val(),
                    con_carrier: $('#carrier').val() == '' ? null : $('#carrier').val(),
                }

                self.DB.addConsolidation(consolidationData)
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

ConsolidationsClass.prototype.formatData = function (consolidations) {
    let self = this

    let retData = []
    let finalData = []
    let groupSumKG = {}
    for (let cons of consolidations) {
        cons.con_request_date = self.Helpers.changeMysqlDateToNormal(cons.con_request_date)

        if (typeof groupSumKG[cons.group_id] === 'undefined') groupSumKG[cons.group_id] = { local: 0, grouped: 0 }
        if (cons.con_type == 'Grouped') groupSumKG[cons.group_id].grouped += cons.con_kg
        if (cons.con_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) groupSumKG[cons.group_id].local += cons.con_kg
        retData.push(cons)
    }
    for (let con of retData) {
        if (con.con_type == 'Individual') {
            // JOB IS JUST A SIMPLE INDIVIDUAL JOB
            con.visible_consolidation_cost = con.con_estimate_cost
            con.con_cost_per_kg = (con.con_estimate_cost / con.con_kg).toFixed(2)
            con.con_shared_cost = con.con_estimate_cost
        }
        if (con.con_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT) {
            // Job is a local dispacth job
            con.visible_consolidation_cost = con.con_group_local_cost
            con.con_cost_per_kg = (con.con_group_local_cost / groupSumKG[con.group_id].local).toFixed(2)
            con.con_shared_cost = ((con.con_kg * con.con_group_local_cost) / groupSumKG[con.group_id].local).toFixed(2)
        }
        if (con.con_type == 'Grouped') {
            // Job is grouped
            con.visible_consolidation_cost = con.con_group_cost
            con.con_cost_per_kg = (con.con_group_cost / groupSumKG[con.group_id].grouped).toFixed(2)
            con.con_shared_cost = ((con.con_kg * con.con_group_cost) / groupSumKG[con.group_id].grouped).toFixed(2)
        }

        finalData.push(con)
    }

    return finalData
}

ConsolidationsClass.prototype.initialiazeCitiesSelect = function () {
    let self = this
    $('#group-ex-select').empty()
    $('#group-to-select').empty()
    $('#group-ex-select').append('<option></option>')
    $('#group-to-select').append('<option></option>')
    for (i = 0; i < self.DB.cities.length; i++) {
        $('#group-ex-select').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
        $('#group-to-select').append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    }
    $('#group-ex-select').trigger('chosen:updated')
    $('#group-to-select').trigger('chosen:updated')
}

ConsolidationsClass.prototype.findChoosenValueForCities = function (ex_city, to_city) {
    let self = this
    let cities = self.DB.cities
    for (i = 0; i < cities.length; i++) {
        if (cities[i].city_name == ex_city) {
            $('#group-ex-select').val(cities[i].city_id)
            $('#group-ex-select').trigger('chosen:updated')
        }
        if (cities[i].city_name == to_city) {
            $('#group-to-select').val(cities[i].city_id)
            $('#group-to-select').trigger('chosen:updated')
        }
    }
}

ConsolidationsClass.prototype.refreshTable = function () {
    let self = this
    $('#consolidations_table').unbind('click')
    $('#consolidations_table').DataTable().clear()
    $('#consolidations_table').DataTable().destroy()
    setTimeout(function () {
        self.initializetable()
    }, 2000)
}

ConsolidationsClass.prototype.initializeServiceTypeSelect = function () {
    let self = this

    $('#service-type-select').empty()
    $('#service-type-select').append('<option></option>')
    for (i = 0; i < self.DB.consolidationServiceTypes.length; i++) {
        $('#service-type-select').append(
            new Option(self.DB.consolidationServiceTypes[i].service_type_description, self.DB.consolidationServiceTypes[i].service_type_id)
        )
    }
    $('#service-type-select').trigger('chosen:updated')
}

ConsolidationsClass.prototype.calculateGroupSavings = async function () {
    let self = this
    let totalIndCount = 0
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 500)
    })
    let rate = $('#currency_rate').val()
    $('.grouped-estimate-cost-input').each(function () {
        if ($(this).val() == '') return
        totalIndCount = totalIndCount + parseFloat($(this).val())
    })
    $('#group-savings').val(self.Helpers.applyRate(totalIndCount - $('#group-cost').val(), rate))
}

ConsolidationsClass.prototype.validGroupData = function (tableData, groupId) {
    let self = this
    let groupJobs = []
    for (let i = 0; i < tableData.length; i++) {
        if (tableData[i].con_group_id == groupId) groupJobs.push(tableData[i])
    }
    console.log(groupJobs)
    if (
        groupJobs[0].con_group_ex == null ||
        groupJobs[0].con_group_to == null ||
        groupJobs[0].con_group_deadline == null ||
        groupJobs[0].con_group_deadline == '' ||
        groupJobs[0].con_group_mode == '' ||
        groupJobs[0].con_group_mode == null ||
        groupJobs[0].con_group_service_type == null ||
        groupJobs[0].con_group_service_type == '' ||
        groupJobs[0].con_group_forwarder == '' ||
        groupJobs[0].con_group_forwarder == null
    )
        return false
    let localJobs = groupJobs.filter(el => el.con_type == self.Helpers.LOCAL_SERVICE_TYPE_TEXT)
    let importJobs = groupJobs.filter(el => el.con_type == 'Individual')
    let groupedJobs = groupJobs.filter(el => el.con_type == 'Grouped')

    if (localJobs.length != 0) {
        if (localJobs[0].con_group_local_cost == null || localJobs[0].con_group_local_cost == '' || localJobs[0].con_group_local_cost == 0)
            return false
    }
    if (groupedJobs.length != 0) {
        if (groupedJobs[0].con_group_cost == null || groupedJobs[0].con_group_cost == '' || groupedJobs[0].con_group_cost == 0) return false
        for (let job of groupedJobs) if (job.con_estimate_cost == null || job.con_estimate_cost == 0 || job.con_estimate_cost == '') return false
    }
    if (importJobs.length != 0) {
        for (let job of importJobs) if (job.con_estimate_cost == null || job.con_estimate_cost == 0 || job.con_estimate_cost == '') return false
    }
    return true
}

ConsolidationsClass.prototype.handleCurrencyInputChange = function (e) {
    let self = this
    let triggerInputFlag = e.data('trigger-flag')
    let inputVal = e.val()
    let currencyRate = $('#currency_rate').val()
    if (currencyRate == '' || currencyRate == null || inputVal == '') return
    $('.currency-slave').each(function () {
        let myTriggerFlag = $(this).data('trigger-flag')
        if (myTriggerFlag == triggerInputFlag) {
            $(this).val(self.Helpers.applyRate(inputVal, currencyRate))
            return
        }
    })
}

ConsolidationsClass.prototype.rebindEventsOnCurrencies = function () {
    let self = this
    $('.currency-input').unbind('change keyup')
    $('.currency-input').on('change keyup', function () {
        self.handleCurrencyInputChange($(this))
    })
}
