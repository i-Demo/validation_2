function Validator(options) {

    //  Định nghĩa các rule của validator
    validatorRules = {
        required: function (input) {
            switch (input.type) {
                case 'checkbox':
                case 'radio':
                    var inputChecked = formElement.querySelector(`input[name="${input.name}"]:checked`);
                    return inputChecked ? undefined : 'Vui lòng chọn giá trị'
                // break;
                default:
                    return input.value.trim() ? undefined : 'Vui lòng nhập trường này';
            }
        },
        mail: function (input) {
            const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (input.value === '') {
                return 'Nhập email';
            } else {
                return input.value.match(mailFormat) ? undefined : 'Vui lòng nhập đúng email'
                // return mailFormat.test(input.value) ? undefined : 'Vui lòng nhập đúng email'
            }
        },
        pass: function (input) {
            if (input.value === '') {
                return 'Vui lòng nhập mật khẩu'
            } else {
                return input.value.length >= 6 ? undefined : 'Mật khẩu phải lớn hơn 6 ký tự';
            }

        },
        repass: function (input) {
            var passElement = formElement.querySelector('input[type="password"]');
            if (input.value === '') {
                return 'Vui lòng nhập lại mật khẩu'
            } else {
                return input.value === passElement.value ? undefined : 'Mật khẩu nhập lại không khớp';
            }
        }
    }

    // Hàm lấy element cha ngoài cùng để thêm message lỗi
    function getParent(input, selector = options.formGroupSelector) {
        while (input.parentElement) {
            if (input.parentElement.matches(selector)) {
                return input.parentElement;
            } else {
                input = input.parentElement;
            }
        }
    }

    // Hàm validate cho Input
    function validate(input) {
        // Lấy message lỗi (message string or undefined)
        var message = validatorRules[input.getAttribute('rule')](input);
        if (message) {
            var parentInput = getParent(input);
            var validateMessage = parentInput.querySelector('.validateMessage');

            // Nếu chưa có span message lỗi thì thêm
            if (!validateMessage) {
                input.classList.add('invalid');
                var span = document.createElement('span');
                span.classList.add('validateMessage');
                span.innerHTML = message;
                parentInput.appendChild(span);
            } else {
                validateMessage.innerHTML = message;
            }
            // Trả về true (có lỗi)
            return true;
        } else {
            invalidate(input);
            // Trả về false (k lỗi)
            return false;
        }
    }

    // Hàm invalidate cho input
    function invalidate(input) {
        var parentInput = getParent(input);
        var validateMessage = parentInput.querySelector('.validateMessage');

        if (validateMessage) {
            input.classList.remove('invalid');
            parentInput.removeChild(validateMessage);
        }
    }

    /* ----------------- Hàm bắt đầu thực thi ---------------------*/
    // Lấy form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        var ruleInputs = formElement.querySelectorAll('[name][rule]');
        // Lặp qua từng input có rule
        Array.from(ruleInputs).forEach(function (input) {
            // Validate khi blur ra input 
            input.onblur = function () {
                validate(input);
            };

            // Invalidate khi bắt đầu điền form
            input.oninput = function () {
                invalidate(input);
            }
        })

        // Sự kiện khi submit form
        formElement.onsubmit = function (e) {
            var errorCount = 0;
            var formData = {};
            // Ngăn cản hành động submit form mặc định
            e.preventDefault();

            Array.from(ruleInputs).forEach(function (input) {
                // Validate input, đồng thời kiểm tra form có lỗi k?
                if (validate(input)) {
                    // Có lỗi thì đếm
                    errorCount++;
                } else {
                    // Không lỗi thêm thông tin input vào data
                    switch (input.type) {
                        case 'checkbox':
                            if (input.checked) {
                                if (Array.isArray(formData[input.name])) {
                                    formData[input.name].push(input.value);
                                } else {
                                    formData[input.name] = [input.value];
                                }
                            }
                            break;
                        case 'radio':
                            if (input.checked) {
                                formData[input.name] = input.value;
                            }
                            break;
                        case 'file':
                            formData[input.name] = input.files;
                            break;
                        default:
                            formData[input.name] = input.value;
                    }
                }
            })

            // Nếu hết lỗi thì send data
            if (errorCount === 0) {
                console.log(formData);
            }
        }
    }
}