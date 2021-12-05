let ConsolidationsClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.Helpers.bindMovingEvents("cost-modal-header")
    this.Helpers.initializeUser()
    this.bindEventsOnButtons()
    this.DB.getAllCities()
    let self = this
    setTimeout(function () {
        self.initializetable()
        self.initialiazeCitiesSelect()
    }, 500)

    setTimeout(function () {
        $("#add-consolidation-btn").attr("disabled", null)
    }, 1000)
}

ConsolidationsClass.prototype.initializetable = async function () {
    let self = this

    const consolidations = await self.DB.getAllConsolidations()

    let tableData = self.formatData(consolidations)
    let consolidationsTable = $("#consolidations_table").DataTable({
        data: tableData,
        processing: true,
        fixedHeader: {
            headerOffset: 100,
            header: true,
            footer: false,
        },
        bLengthChange: false,
        columns: [
            { title: "ID", orderable: false, data: "con_id" },
            { title: "GROUP ID", orderable: false, data: "group_id" },
            { title: "REQ. DATE", orderable: false, data: "con_request_date" },
            { title: "USER", orderable: false, data: "user_username" },
            { title: "DEPARTMENT", orderable: false, data: "division_description" },
            { title: "PRODUCTS", orderable: false, data: "con_products" },
            { title: "MODE", orderable: false, data: "con_group_mode" },
            { title: "VESSELS", orderable: false, data: "con_vessels" },
            { title: "EX", orderable: false, className: "danger-header", data: "ex_name" },
            { title: "TO", orderable: false, className: "danger-header", data: "to_name" },
            { title: "DEADLINE", orderable: false, className: "danger-header", data: "con_group_deadline" },
            { title: "FORWARDER", orderable: false, data: "con_group_forwarder" },
            { title: "REFERENCE", orderable: false, data: "con_reference" },
            { title: "CONSOL. COST", orderable: false, data: "con_group_cost" },
            { title: "KG", orderable: false, data: "con_kg" },
            { title: "COST / KG (€)", orderable: false, data: "con_cost_per_kg" },
            { title: "SHARED CONS COST (€)", visible: true, data: "con_shared_cost" },
            {
                title: "ACTIONS",
                orderable: false,
                createdCell: function (td, cellData, rowData, row, col) {
                    if (
                        rowData.to_name == null ||
                        rowData.ex_name == null ||
                        rowData.con_group_cost == null ||
                        rowData.con_group_deadline == null ||
                        rowData.con_group_forwarder == null ||
                        rowData.con_group_mode == null
                    ) {
                        $(td).children(".confirm-job").hide()
                    } else {
                        $(td).children(".delete-job").hide()
                    }
                },
                defaultContent:
                    "<i class='fa fa-check confirm-job action-btn' style='cursor: pointer' ></i><i class='fa fa-dollar costs-job action-btn' style='cursor: pointer' ></i><i class='fa fa-trash delete-job action-btn' style='cursor: pointer' ></i>",
            },
        ],
        rowCallback: function (row, data, index, cells) {
            //Here I am changing background Color
            $("td", row).css("background-color", data.con_group_color)
        },
        order: [[1, "asc"]],
        pageLength: 25,
    })
    $("#consolidations_table").on("click", "i.delete-job", function () {
        var data = consolidationsTable.row($(this).closest("tr")).data()
        console.log(data)
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            Swal.fire({
                title: "Unable to delete this job.",
                text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                icon: "error",
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        Swal.fire({
            title: "Delete Job?",
            text: "Are you sure you want to delete this job? You won't be able to revert it!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Confirm",
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.deleteConsolidation(data)
                self.Helpers.toastr("success", "Group is deleted successfully!")
                self.refreshTable()
            }
        })
    })
    $("#consolidations_table").on("click", "i.confirm-job", function () {
        var data = consolidationsTable.row($(this).closest("tr")).data()
        let emptyData = false
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            Swal.fire({
                title: "Unable to confirm this job.",
                text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                icon: "error",
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        Swal.fire({
            title: "Confirm Group?",
            text: "Are you sure you want to confirm this group? You won't be able to revert it!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Confirm",
        }).then(result => {
            if (result.isConfirmed) {
                self.DB.confirmConsGroup(data)
                self.Helpers.toastr("success", "Job is confirmed successfully!")
                self.refreshTable()
            }
        })
    })
    $("#consolidations_table").on("click", "i.costs-job", function () {
        var data = consolidationsTable.row($(this).closest("tr")).data()
        self.selectedGroupID = data.group_id
        if (!self.Helpers.checkIfUserHasPriviledges(data.user_username)) {
            Swal.fire({
                title: "Unable to delete this job.",
                text: "Unfortunately this is a job inserted by different user. You can't modify it.",
                icon: "error",
                showCancelButton: true,
                showConfirmButton: false,
            })
            return
        }
        self.findChoosenValueForCities(data.ex_name, data.to_name)
        $("#group-mode-select").val(data.con_group_mode)
        $("#group-mode-select").trigger("chosen:updated")
        $("#group-forwarder").val(data.con_group_forwarder)
        $("#group-cost").val(data.con_group_cost)
        $("#group-deadline").val(data.con_group_deadline)
        $("#group-modal").modal("show")
        $("#save-group-data").attr("disabled", null)
    })
}

ConsolidationsClass.prototype.bindEventsOnButtons = function () {
    let self = this

    $("#group-mode-select").chosen()
    $("#group-ex-select").chosen()
    $("#group-to-select").chosen()

    $("#logout-ref").on("click", function () {
        self.Helpers.handleLogout()
    })

    $("#save-group-data").on("click", async function () {
        $(this).attr("disabled", "disabled")
        let groupData = {
            groupId: self.selectedGroupID,
            groupMode: $("#group-mode-select").val(),
            groupForwarder: $("#group-forwarder").val(),
            groupEx: $("#group-ex-select").val(),
            groupTo: $("#group-to-select").val(),
            groupCost: $("#group-cost").val(),
            groupDeadline: $("#group-deadline").val(),
        }
        console.log(groupData)
        let emptyData = false
        Object.keys(groupData).forEach(key => {
            if (groupData[key] === "") {
                emptyData = true
                return
            }
        })
        if (emptyData) {
            self.Helpers.toastr("error", "Some fields are empty!")
            $(this).attr("disabled", null)
            return
        }
        let updateData = await self.DB.updateConGroupData(groupData)
        if (updateData && updateData.affectedRows == 1) {
            self.Helpers.toastr("success", "Consolidation group updated!")
            $("#group-modal").modal("hide")
            self.refreshTable()
        }
    })
}

ConsolidationsClass.prototype.bindSaveEventOnSaveJobButton = function () {
    let self = this
    $("#save-job-btn").unbind("click")

    $("#save-job-btn").on("click", function () {
        var modeSelectValue = $("#mode-select").val()
        var divisionSelectValue = $("#division-select").val()
        var productSelectValue = $("#product-select").val()
        var vesselSelectValue = $("#vessel-select").val()
        var actualWeight = $("#actual_weight").val()
        var volumeWeight = $("#volume_weight").val()
        var cutoffDate = $("#cutoff_date").val()
        var deadlinedate = $("#deadline_date").val()
        var reference = $("#reference").val()

        if (
            modeSelectValue != "" &&
            divisionSelectValue != "" &&
            productSelectValue != "" &&
            vesselSelectValue != "" &&
            actualWeight != "" &&
            volumeWeight != "" &&
            cutoffDate != "" &&
            deadlinedate != "" &&
            reference != ""
        ) {
            $(this).attr("disabled", "disabled")
            var ind_ex = ""
            var ind_to = ""
            if (modeSelectValue == "Air") {
                ind_ex = $("#ex-select-airport").val()
                ind_to = $("#to-select-airport").val()
            } else if (modeSelectValue == "Sea") {
                ind_ex = $("#ex-select-port").val()
                ind_to = $("#to-select-port").val()
            } else {
                ind_ex = $("#ex-input").val()
                ind_to = $("#to-input").val()
            }

            if (ind_ex != "" && ind_to != "") {
                var consolidationData = {
                    con_user_id: self.Helpers.user_id,
                    con_division_id: divisionSelectValue,
                    con_product_id: productSelectValue,
                    con_mode: modeSelectValue,
                    con_reference: reference,
                    con_actual_weight: actualWeight,
                    con_length: $("#length").val() == "" ? 0 : $("#length").val(),
                    con_width: $("#width").val() == "" ? 0 : $("#width").val(),
                    con_height: $("#height").val() == "" ? 0 : $("#height").val(),
                    con_pieces: $("#pieces").val() == "" ? 0 : $("#pieces").val(),
                    con_volume_weight: volumeWeight,
                    con_chargable_weight: volumeWeight > actualWeight ? volumeWeight : actualWeight,
                    con_vessel_id: vesselSelectValue,
                    con_ex: ind_ex,
                    con_to: ind_to,
                    con_request_date: self.Helpers.getDateTimeNow(),
                    con_deadline: self.Helpers.changeDateToMysql($("#deadline_date").val()),
                    con_cut_off_date: self.Helpers.changeDateToMysql($("#cutoff_date").val()),
                    con_notes: $("#notes").val(),
                    con_carrier: $("#carrier").val() == "" ? null : $("#carrier").val(),
                }

                self.DB.addConsolidation(consolidationData)
            } else {
                $(this).attr("disabled", null)
                self.Helpers.toastr("error", "Some required fields are empty.")
            }
        } else {
            $(this).attr("disabled", null)
            self.Helpers.toastr("error", "Some required fields are empty.")
        }
    })
}

ConsolidationsClass.prototype.initialiazeExToSelect = function (modeValue) {
    let self = this

    switch (modeValue) {
        case "Air":
            $("#ex-select-port-div").hide()
            $("#to-select-port-div").hide()
            $("#to-input-div").hide()
            $("#ex-input-div").hide()

            $("#ex-select-airport-div").show("500")
            $("#to-select-airport-div").show("500")
            break
        case "Sea":
            $("#ex-select-airport-div").hide()
            $("#to-select-airport-div").hide()
            $("#to-input-div").hide()
            $("#ex-input-div").hide()

            $("#ex-select-port-div").show("500")
            $("#to-select-port-div").show("500")
            break
        default:
            $("#ex-select-airport-div").hide()
            $("#to-select-airport-div").hide()
            $("#ex-select-port-div").hide()
            $("#to-select-port-div").hide()

            $("#to-input-div").show("500")
            $("#ex-input-div").show("500")
            break
    }
}

ConsolidationsClass.prototype.formatData = function (consolidations) {
    let self = this

    let retData = []
    let finalData = []
    let groupSumKG = {}
    for (let cons of consolidations) {
        cons.con_request_date = self.Helpers.changeMysqlDateToNormal(cons.con_request_date)

        if (typeof groupSumKG[cons.group_id] === "undefined") groupSumKG[cons.group_id] = 0
        groupSumKG[cons.group_id] += cons.con_kg
        retData.push(cons)
    }
    for (let con of retData) {
        con.con_cost_per_kg = (con.con_group_cost / groupSumKG[con.group_id]).toFixed(2)
        con.con_shared_cost = ((con.con_kg * con.con_group_cost) / groupSumKG[con.group_id]).toFixed(2)
        finalData.push(con)
    }

    return finalData
}

ConsolidationsClass.prototype.initialiazeCitiesSelect = function () {
    let self = this
    $("#group-ex-select").empty()
    $("#group-to-select").empty()
    $("#group-ex-select").append("<option></option>")
    $("#group-to-select").append("<option></option>")
    for (i = 0; i < self.DB.cities.length; i++) {
        $("#group-ex-select").append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
        $("#group-to-select").append(new Option(self.DB.cities[i].city_name, self.DB.cities[i].city_id))
    }
    $("#group-ex-select").trigger("chosen:updated")
    $("#group-to-select").trigger("chosen:updated")
}

ConsolidationsClass.prototype.findChoosenValueForCities = function (ex_city, to_city) {
    let self = this
    let cities = self.DB.cities
    for (i = 0; i < cities.length; i++) {
        if (cities[i].city_name == ex_city) {
            $("#group-ex-select").val(cities[i].city_id)
            $("#group-ex-select").trigger("chosen:updated")
        }
        if (cities[i].city_name == to_city) {
            $("#group-to-select").val(cities[i].city_id)
            $("#group-to-select").trigger("chosen:updated")
        }
    }
}

ConsolidationsClass.prototype.refreshTable = function () {
    let self = this
    $("#consolidations_table").unbind("click")
    $("#consolidations_table").DataTable().clear()
    $("#consolidations_table").DataTable().destroy()
    setTimeout(function () {
        self.initializetable()
    }, 2000)
}
