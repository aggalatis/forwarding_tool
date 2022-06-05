const { fsyncSync } = require('original-fs')

let StatisticsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.initializeUser()
    this.Helpers.initCurrencyInfo()
    this.tableData = []
    this.bindEventsOnButtons()
}

StatisticsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#update-data').on('click', async function () {
        var fromDate = $('#from_date').val()
        var toDate = $('#to_date ').val()
        if (fromDate == '' || toDate == '') {
            self.Helpers.toastr('error', 'Please select dates first.')
            return
        }
        let mysqlFromDate = self.changeSelectionDateToMysql(fromDate) + ' 00:00:00'
        let mysqlToDate = self.changeSelectionDateToMysql(toDate) + ' 23:59:59'
        let individualsData = await self.DB.getIndividualReport(mysqlFromDate, mysqlToDate)
        let personnelData = await self.DB.getPersonnelReport(mysqlFromDate, mysqlToDate)
        let groupedData = await self.DB.getIndGroupedReport(mysqlFromDate, mysqlToDate)
        let consolidationData = await self.DB.getConGroupedReport(mysqlFromDate, mysqlToDate)
        self.tableData = self.formatResultsData(individualsData, personnelData, groupedData, consolidationData)
        self.initializeChart()
        self.initializeTable()
        self.updateCards()
    })

    $('#print-data').on('click', function () {
        self.takeScreenShot()
    })
}

StatisticsClass.prototype.formatResultsData = function (individuals, personnel, grouped, consolidations) {
    let self = this
    let finalData = {}
    let totals = {
        individualEstimateCost: 0,
        personnelEstimateCost: 0,
        personnelActualCost: 0,
        personnelSavings: 0,
        personnelSavingsPercent: 0,
        groupedEstimateCost: 0,
        groupedSharedCost: 0,
        groupedSavings: 0,
        groupedSavingsPercent: 0,
        consolidatedEstimateCost: 0,
        consolidatedSharedCost: 0,
        consolidatedSavings: 0,
        consolidatedSavingsPercent: 0,
    }
    for (let ind of individuals) {
        if (typeof finalData[ind.division_description] == 'undefined') {
            finalData[ind.division_description] = {}
        }
        finalData[ind.division_description].individualEstimateCost = ind.sum_estimate_cost
        totals.individualEstimateCost += ind.sum_estimate_cost
    }

    for (let per of personnel) {
        if (typeof finalData[per.division_description] == 'undefined') {
            finalData[per.division_description] = {}
        }
        finalData[per.division_description].personnelEstimateCost = per.sum_estimate_cost
        finalData[per.division_description].personnelActualCost = per.sum_actual_cost
        finalData[per.division_description].personnelSavings = per.savings
        finalData[per.division_description].personnelSavingsPercent = per.savings_percent

        totals.personnelEstimateCost += per.sum_estimate_cost
        totals.personnelActualCost += per.sum_actual_cost
        totals.personnelSavings += per.savings
        totals.personnelSavingsPercent += per.savings_percent
    }

    for (let group of grouped) {
        if (typeof finalData[group.division_description] == 'undefined') {
            finalData[group.division_description] = {}
        }
        finalData[group.division_description].groupedEstimateCost = group.sum_estimate_cost
        finalData[group.division_description].groupedSharedCost = group.shared_cost
        finalData[group.division_description].groupedSavings = group.savings
        finalData[group.division_description].groupedSavingsPercent = group.savings_percent

        totals.groupedEstimateCost += group.sum_estimate_cost
        totals.groupedSharedCost += group.shared_cost
        totals.groupedSavings += group.savings
        totals.groupedSavingsPercent += group.savings_percent
    }

    for (let con of consolidations) {
        if (typeof finalData[con.division_description] == 'undefined') {
            finalData[con.division_description] = {}
        }
        finalData[con.division_description].consolidatedEstimateCost = con.sum_estimate_cost
        finalData[con.division_description].consolidatedSharedCost = con.shared_cost
        finalData[con.division_description].consolidatedSavings = con.savings
        finalData[con.division_description].consolidatedSavingsPercent = con.savings_percent

        totals.consolidatedEstimateCost += con.sum_estimate_cost
        totals.consolidatedSharedCost += con.shared_cost
        totals.consolidatedSavings += con.savings
        totals.consolidatedSavingsPercent += con.savings_percent
    }
    finalData.Total = totals

    let returnData = []
    for (let key in finalData) {
        typeof finalData[key].individualEstimateCost == 'undefined' || finalData[key].individualEstimateCost == null
            ? (finalData[key].individualEstimateCost = 0)
            : (finalData[key].individualEstimateCost = finalData[key].individualEstimateCost.toFixed(2))

        typeof finalData[key].personnelEstimateCost == 'undefined' || finalData[key].personnelEstimateCost == null
            ? (finalData[key].personnelEstimateCost = 0)
            : (finalData[key].personnelEstimateCost = finalData[key].personnelEstimateCost.toFixed(2))

        typeof finalData[key].personnelActualCost == 'undefined' || finalData[key].personnelActualCost == null
            ? (finalData[key].personnelActualCost = 0)
            : (finalData[key].personnelActualCost = finalData[key].personnelActualCost.toFixed(2))

        typeof finalData[key].personnelSavings == 'undefined' || finalData[key].personnelSavings == null
            ? (finalData[key].personnelSavings = 0)
            : (finalData[key].personnelSavings = finalData[key].personnelSavings.toFixed(2))

        typeof finalData[key].personnelSavingsPercent == 'undefined' || finalData[key].personnelSavingsPercent == null
            ? (finalData[key].personnelSavingsPercent = 0)
            : (finalData[key].personnelSavingsPercent = finalData[key].personnelSavingsPercent.toFixed(2))

        typeof finalData[key].groupedEstimateCost == 'undefined' || finalData[key].groupedEstimateCost == null
            ? (finalData[key].groupedEstimateCost = 0)
            : (finalData[key].groupedEstimateCost = finalData[key].groupedEstimateCost.toFixed(2))

        typeof finalData[key].groupedSharedCost == 'undefined' || finalData[key].groupedSharedCost == null
            ? (finalData[key].groupedSharedCost = 0)
            : (finalData[key].groupedSharedCost = finalData[key].groupedSharedCost.toFixed(2))

        typeof finalData[key].groupedSavings == 'undefined' || finalData[key].groupedSavings == null
            ? (finalData[key].groupedSavings = 0)
            : (finalData[key].groupedSavings = finalData[key].groupedSavings.toFixed(2))

        typeof finalData[key].groupedSavingsPercent == 'undefined' || finalData[key].groupedSavingsPercent == null
            ? (finalData[key].groupedSavingsPercent = 0)
            : (finalData[key].groupedSavingsPercent = finalData[key].groupedSavingsPercent.toFixed(2))

        typeof finalData[key].consolidatedEstimateCost == 'undefined' || finalData[key].consolidatedEstimateCost == null
            ? (finalData[key].consolidatedEstimateCost = 0)
            : (finalData[key].consolidatedEstimateCost = finalData[key].consolidatedEstimateCost.toFixed(2))

        typeof finalData[key].consolidatedSharedCost == 'undefined' || finalData[key].consolidatedSharedCost == null
            ? (finalData[key].consolidatedSharedCost = 0)
            : (finalData[key].consolidatedSharedCost = finalData[key].consolidatedSharedCost.toFixed(2))

        typeof finalData[key].consolidatedSavings == 'undefined' || finalData[key].consolidatedSavings == null
            ? (finalData[key].consolidatedSavings = 0)
            : (finalData[key].consolidatedSavings = finalData[key].consolidatedSavings.toFixed(2))

        typeof finalData[key].consolidatedSavingsPercent == 'undefined' || finalData[key].consolidatedSavingsPercent == null
            ? (finalData[key].consolidatedSavingsPercent = 0)
            : (finalData[key].consolidatedSavingsPercent = finalData[key].consolidatedSavingsPercent.toFixed(2))

        finalData[key].department = key
        returnData.push(finalData[key])
    }
    return returnData
}

StatisticsClass.prototype.changeSelectionDateToMysql = function (date) {
    let spliitedDate = date.split('/')
    return `${spliitedDate[2]}-${spliitedDate[1]}-${spliitedDate[0]}`
}

StatisticsClass.prototype.updateCards = function () {
    let self = this
    let totalData = self.tableData.find(e => e.department == 'Total')
    let totalBeforeGrouping =
        parseFloat(totalData.individualEstimateCost) +
        parseFloat(totalData.personnelEstimateCost) +
        parseFloat(totalData.groupedEstimateCost) +
        parseFloat(totalData.consolidatedEstimateCost)

    let totalAfterGrouping =
        parseFloat(totalData.individualEstimateCost) +
        parseFloat(totalData.personnelActualCost) +
        parseFloat(totalData.groupedSharedCost) +
        parseFloat(totalData.consolidatedSharedCost)
    $('#total-cost-without-grouping').html(totalBeforeGrouping.toFixed(2))
    $('#total-cost-with-grouping').html(totalAfterGrouping.toFixed(2))
    $('#total-savings').html((totalBeforeGrouping - totalAfterGrouping).toFixed(2))
    $('#total-savings-percent').html((((totalBeforeGrouping - totalAfterGrouping) / totalBeforeGrouping) * 100).toFixed(2))
}

StatisticsClass.prototype.initializeTable = function () {
    let self = this

    $('#table-div').show()
    $('#overview-table').unbind('click')
    $('#overview-table').DataTable().clear()
    $('#overview-table').DataTable().destroy()
    $('#overview-table').DataTable({
        data: self.tableData,
        processing: true,
        bLengthChange: false,
        searching: false,
        columns: [
            { data: 'department', orderable: true },
            {
                data: 'individualEstimateCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'groupedEstimateCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'groupedSharedCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'groupedSavings',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') {
                        $(td).css('font-weight', 'bold')
                    }
                },
            },
            {
                data: 'groupedSavingsPercent',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') {
                        $(td).css('font-weight', 'bold')
                        $(td).html('-')
                    }
                },
            },
            {
                data: 'personnelEstimateCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'personnelActualCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'personnelSavings',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'personnelSavingsPercent',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') {
                        $(td).css('font-weight', 'bold')
                        $(td).html('-')
                    }
                },
            },
            {
                data: 'consolidatedEstimateCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'consolidatedSharedCost',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'consolidatedSavings',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: 'consolidatedSavingsPercent',
                createdCell: function (td, cellData, rowData, row, col) {
                    if (rowData.department == 'Total') {
                        $(td).css('font-weight', 'bold')
                        $(td).html('-')
                    }
                },
            },
            {
                data: null,
                createdCell: function (td, cellData, rowData, row, col) {
                    let rowTotal =
                        parseFloat(rowData.individualEstimateCost) +
                        parseFloat(rowData.personnelEstimateCost) +
                        parseFloat(rowData.groupedEstimateCost) +
                        parseFloat(rowData.consolidatedEstimateCost)
                    $(td).html(`${rowTotal.toFixed(2)}`)
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
            {
                data: null,
                createdCell: function (td, cellData, rowData, row, col) {
                    let rowTotal =
                        parseFloat(rowData.individualEstimateCost) +
                        parseFloat(rowData.personnelActualCost) +
                        parseFloat(rowData.groupedSharedCost) +
                        parseFloat(rowData.consolidatedSharedCost)
                    $(td).html(`<b>${rowTotal.toFixed(2)}</b>`)
                },
            },
            {
                data: null,
                createdCell: function (td, cellData, rowData, row, col) {
                    let rowTotal = parseFloat(rowData.personnelSavings) + parseFloat(rowData.groupedSavings) + parseFloat(rowData.consolidatedSavings)
                    $(td).html(rowTotal.toFixed(2))
                    if (rowData.department == 'Total') $(td).css('font-weight', 'bold')
                },
            },
        ],
        pageLength: 25,
    })
    self.Helpers.applyMouseInteractions('overview-table')
}

StatisticsClass.prototype.initializeChart = function () {
    let self = this
    let totalData = self.tableData.find(e => e.department == 'Total')
    let pieChart = document.getElementById('overviewchart').getContext('2d')
    if (
        totalData.individualEstimateCost == 0 &&
        totalData.groupedSharedCost == 0 &&
        totalData.personnelActualCost == 0 &&
        totalData.consolidatedSharedCost == 0
    ) {
        $('#pie-div').hide(500)
        return
    }
    $('#pie-div').show(500)
    let pieData = {
        labels: ['IND', 'GROUP', 'PERS', 'CONS'],
        datasets: [
            {
                data: [
                    parseFloat(totalData.individualEstimateCost),
                    parseFloat(totalData.groupedSharedCost),
                    parseFloat(totalData.personnelActualCost),
                    parseFloat(totalData.consolidatedSharedCost),
                ],
                backgroundColor: ['#F08080', '#90EE90', '#ADD8E6', '#F0E68C'],
                hoverBackgroundColor: ['#F08080', '#90EE90', '#ADD8E6', '#F0E68C'],
                borderWidth: 0,
                hoverBorderWidth: 6,
                hoverBorderColor: ['#F08080', '#90EE90', '#ADD8E6', '#F0E68C'],
            },
        ],
    }
    new Chart(pieChart, {
        type: 'pie',
        data: pieData,
        options: {
            legend: {
                display: false,
            },
            animation: {
                animateScale: true,
            },
        },
    })
}

StatisticsClass.prototype.takeScreenShot = async function () {
    ipcRenderer.send('print')
}
