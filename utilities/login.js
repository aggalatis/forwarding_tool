let LoginClass = function () {
    this.DB = new DbClass()
    this.Helpers = new HelpersClass()
    this.submitFormOnEnter()
    $('#iso-read-more').on('click', function () {
        var dots = document.getElementById('dots')
        var moreText = document.getElementById('more')
        var btnText = document.getElementById('iso-read-more')

        if (dots.style.display === 'none') {
            dots.style.display = 'inline'
            btnText.innerHTML = 'Read more'
            moreText.style.display = 'none'
        } else {
            dots.style.display = 'none'
            btnText.innerHTML = 'Read less'
            moreText.style.display = 'inline'
        }
    })
}

LoginClass.prototype.submitLoginForm = function () {
    let self = this
    var username = $('#user_username').val()
    var password = $('#user_password').val()

    self.DB.verifyLogin(username, password)
}

LoginClass.prototype.submitFormOnEnter = function () {
    let self = this
    $('#user_username').focus()

    $('#user_username').on('keyup', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault()

            $('#sign-in-btn').trigger('click')
        }
    })

    $('#user_password').on('keyup', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault()

            $('#sign-in-btn').trigger('click')
        }
    })
}
