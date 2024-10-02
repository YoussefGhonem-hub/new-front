(function () {
    angular
      .module('validation.rule', ['validation'])
      .config(['$validationProvider', function ($validationProvider) {
          var expression = {
              required: function (value) {
                  return !!value;
              },
              url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
              email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
              number: /^\d+$/,
              password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{7,10}/,
              phoneNumber: /^[1-9]{1}[0-9]{8,9}$/,
              workPhone: /^[0]{1}[0-9]{8,9}/,
              isbn: /^(?:(?:-1[03])?:?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
              minlength: function (value, scope, element, attrs, param) {
                  return value && value.length >= param;
              },
              maxlength: function (value, scope, element, attrs, param) {
                  return !value || value.length <= param;
              }
          };

          var defaultMsg = {
              required: {
                  error: {
                      nameEn: 'This should be Required!',
                      nameAr: 'يجب تعبئة هذا الحقل'
                  }
              },
              phoneNumber: {
                  error: {
                      nameEn: 'This should be Phone Number!',
                      nameAr: 'يجب أن تكون صيغة الهاتف صحيحة'
                  }
              },
              workPhone: {
                  error: {
                      nameEn: 'This should be Work Phone!',
                      nameAr: 'يجب أن تكون صيغة الهاتف صحيحة'
                  }
              },
              isbn: {
                  error: {
                      nameEn: 'This should be ISBN!',
                      nameAr: 'رقم ردمك غير صحيح'
                  }
              },
              url: {
                  error: {
                      nameEn: 'This should be Url!',
                      nameAr: 'يجب أن تكون صيغة الرابط صحيحة'
                  }
              },
              password: {
                  error: {
                      nameEn: '',
                      nameAr: ''
                  }
              },
              email: {
                  error: {
                      nameEn: 'This should be Email',
                      nameAr: 'يجب أن تكون صيغة البريد الإلكتروني صحيحة'
                  }
              },
              number: {
                  error: 'This should be Password',
                  success: 'It\'s Number'
              },
              minlength: {
                  error: 'This should be longer',
                  success: 'Long enough!'
              },
              maxlength: {
                  error: 'This should be shorter',
                  success: 'Short enough!'
              }
          };
          $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
      }]);
}).call(this);