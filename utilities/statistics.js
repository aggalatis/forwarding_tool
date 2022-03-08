let StatisticsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.initializeUser()
    this.firstUpdate = 1
    let self = this

    this.bindEventsOnButtons()
}

StatisticsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('#update-data').on('click', function () {
        self.DB.getAllDivisions()
        var fromDate = $('#from_date').val()
        var toDate = $('#to_date ').val()
        var day = moment(toDate, 'DD/MM/YYYY')
        day.add('days', 1)
        toDate = day.format('DD/MM/YYYY')
        if (fromDate !== '' && toDate !== '') {
            if (self.firstUpdate != 1) {
                $('#manager_data_table').DataTable().clear()
                $('#manager_data_table').DataTable().destroy()
            }

            self.firstUpdate = 0
            self.DB.getManagerData(fromDate, toDate)
        } else {
            self.Helpers.toastr('error', 'Please select dates first.')
        }
    })
}
