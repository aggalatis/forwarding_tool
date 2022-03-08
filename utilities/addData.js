let addDataClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.initGlobalSearch(this.DB)
    this.Helpers.bindMovingEvents('city-modal-header')
    this.Helpers.bindMovingEvents('vessel-modal-header')
    this.Helpers.bindMovingEvents('service-type-modal-header')
    this.Helpers.initializeUser()

    this.addEventsOnButtons()
    this.DB.getAllCities()
    this.DB.getAllVessels()
    this.DB.getAllServiceTypes()

    let self = this
    setTimeout(function () {
        self.initCitiesTable()
        self.initVesselsTable()
        self.initServiceTypesTable()
    }, 1500)
}

addDataClass.prototype.addEventsOnButtons = function () {
    let self = this

    $('#logout-ref').on('click', function () {
        self.Helpers.handleLogout()
    })

    $('.data-changer').on('click', function () {
        $('.data-table-div').each(function () {
            $(this).css('display', 'none')
        })
        let tableDivId = $(this).attr('id').replace('-btn', '-div')
        $(`#${tableDivId}`).css('display', 'block')
    })

    $('#save-city').on('click', function () {
        let cityData = {
            city_id: $('#city_id').val(),
            city_name: $('#city_name').val(),
        }
        if (cityData.city_name == '') {
            self.Helpers.toastr('error', 'Some fields are empty..')
            return
        }

        if ($('#city_associate').val() != '') cityData.city_name += ` (${$('#city_associate').val()})`
        if (cityData.city_id == 0) {
            self.DB.addCity(cityData.city_name)
        } else {
            self.DB.updateCity(cityData)
        }
    })
    $('#save-vessel').on('click', function () {
        let vesselData = {
            vessel_id: $('#vessel_id').val(),
            vessel_description: $('#vessel_description').val(),
        }
        if (vesselData.vessel_description == '') {
            self.Helpers.toastr('error', 'Some fields are empty..')
            return
        }
        if (vesselData.vessel_id == 0) {
            self.DB.addVessel(vesselData.vessel_description)
        } else {
            self.DB.updateVessel(vesselData)
        }
    })
    $('#save-service-type').on('click', function () {
        let serviceTypeData = {
            service_type_id: $('#service_type_id').val(),
            service_type_description: $('#service_type_description').val(),
            service_type_group: $('#service_type_group').val(),
        }
        if (serviceTypeData.service_type_description == '') {
            self.Helpers.toastr('error', 'Some fields are empty..')
            return
        }
        if (serviceTypeData.service_type_id == 0) {
            self.DB.addServiceType(serviceTypeData)
        } else {
            self.DB.updateServiceType(serviceTypeData)
        }
    })
    $('#create-city').on('click', function () {
        $('#city_id').val(0)
        $('#city_name').val('')
        $('#city-modal').modal('show')
    })
    $('#create-vessel').on('click', function () {
        $('#vessel_id').val(0)
        $('#vessel_description').val('')
        $('#vessel-modal').modal('show')
    })
    $('#create-service-type').on('click', function () {
        $('#service_type_id').val(0)
        $('#service_type_description').val('')
        $('#service-type-modal').modal('show')
    })
}

addDataClass.prototype.initCitiesTable = async function () {
    let self = this
    let citiesTable = $('#cities-table').DataTable({
        data: self.DB.cities,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: 'ID', orderable: false, data: 'city_id' },
            { title: 'NAME', orderable: false, data: 'city_name' },
            {
                title: 'ACTIONS',
                orderable: false,
                defaultContent:
                    "<i class='fa fa-search edit-job action-btn' title='modify' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' title='delete' style='cursor: pointer' ></i>",
            },
        ],
        order: [[1, 'asc']],
        pageLength: 25,
    })
    $('#cities-table').on('click', 'i.edit-job', function () {
        var data = citiesTable.row($(this).closest('tr')).data()
        $('#city_id').val(data.city_id)
        $('#city_name').val(data.city_name)
        $('#city-modal').modal('show')
    })
    $('#cities-table').on('click', 'i.delete-job', function () {
        var data = citiesTable.row($(this).closest('tr')).data()
        Swal.fire({
            title: 'Delete City?',
            text: `Are you sure you want to delete ${data.city_name}? You won't be able to revert it!`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.deleteCity(data.city_id)
            }
        })
    })
}

addDataClass.prototype.initVesselsTable = async function () {
    let self = this
    let vesselsTable = $('#vessels-table').DataTable({
        data: self.DB.vessels,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: 'ID', orderable: false, data: 'vessel_id' },
            { title: 'NAME', orderable: false, data: 'vessel_description' },
            {
                title: 'ACTIONS',
                orderable: false,
                defaultContent:
                    "<i class='fa fa-search edit-job action-btn' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' style='cursor: pointer' ></i>",
            },
        ],
        order: [[1, 'asc']],
        pageLength: 25,
    })
    $('#vessels-table').on('click', 'i.edit-job', function () {
        var data = vesselsTable.row($(this).closest('tr')).data()
        $('#vessel_id').val(data.vessel_id)
        $('#vessel_description').val(data.vessel_description)
        $('#vessel-modal').modal('show')
    })
    $('#vessels-table').on('click', 'i.delete-job', function () {
        var data = vesselsTable.row($(this).closest('tr')).data()
        Swal.fire({
            title: 'Delete Vessel?',
            text: `Are you sure you want to delete ${data.vessel_description}? You won't be able to revert it!`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.deleteVessel(data.vessel_id)
            }
        })
    })
}
addDataClass.prototype.initServiceTypesTable = async function () {
    let self = this

    let serviceTypes = $('#service-types-table').DataTable({
        data: self.DB.serviceTypes,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: 'ID', orderable: false, data: 'service_type_id' },
            { title: 'GROUP', orderable: false, data: 'service_type_group' },
            { title: 'DESCRIPTION', orderable: false, data: 'service_type_description' },
            {
                title: 'ACTIONS',
                orderable: false,
                defaultContent:
                    "<i class='fa fa-search edit-job action-btn' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' style='cursor: pointer' ></i>",
            },
        ],
        order: [[1, 'asc']],
        pageLength: 25,
    })
    $('#service-types-table').on('click', 'i.edit-job', function () {
        var data = serviceTypes.row($(this).closest('tr')).data()
        $('#service_type_id').val(data.service_type_id)
        $('#service_type_description').val(data.service_type_description)
        $('#service_type_group').val(data.service_type_group)
        $('#service-type-modal').modal('show')
    })
    $('#service-types-table').on('click', 'i.delete-job', function () {
        var data = serviceTypes.row($(this).closest('tr')).data()
        Swal.fire({
            title: 'Delete Service?',
            text: `Are you sure you want to delete ${data.service_type_description}? You won't be able to revert it!`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Confirm',
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.deleteServiceType(data.service_type_id)
            }
        })
    })
}
