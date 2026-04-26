// ============================================
// نظام استبيان جامعة صنعاء - app.js
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("surveyForm");
    
    // التحقق إذا كان المستخدم قد ملأ الاستبيان مسبقاً
    if (localStorage.getItem('surveySubmitted')) {
        document.getElementById('surveyForm').innerHTML = `
            <div class="thank-you-box" style="text-align:center; padding:50px; background:white; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#2c3e50;">شكراً لك! 🎉</h2>
                <p>لقد قمت بتعبئة هذا الاستبيان مسبقاً.</p>
            </div>
        `;
    }
    
    // التحقق من الموافقة
    const consentRadios = document.querySelectorAll('input[name="consent"]');
    consentRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'لا') {
                alert('يجب الموافقة للمتابعة');
                form.style.display = 'none';
            } else {
                form.style.display = 'block';
            }
        });
    });
    
    // إضافة حدث لإظهار/إخفاء حقول الأجهزة الأخرى
    const otherDevicesRadios = document.querySelectorAll('input[name="otherDevicesUse"]');
    otherDevicesRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const otherDevicesTypeGroup = document.getElementById('otherDevicesTypeGroup');
            const otherDevicesDurationGroup = document.getElementById('otherDevicesDurationGroup');
            const otherDevicesDurationSingleGroup = document.getElementById('otherDevicesDurationSingleGroup');
            const otherDevicesDurationDailyGroup = document.getElementById('otherDevicesDurationDailyGroup');
            
            if (this.value === 'نعم') {
                otherDevicesTypeGroup.style.display = 'block';
                otherDevicesDurationGroup.style.display = 'block';
                otherDevicesDurationSingleGroup.style.display = 'block';
                otherDevicesDurationDailyGroup.style.display = 'block';
            } else {
                otherDevicesTypeGroup.style.display = 'none';
                otherDevicesDurationGroup.style.display = 'none';
                otherDevicesDurationSingleGroup.style.display = 'none';
                otherDevicesDurationDailyGroup.style.display = 'none';
                // مسح القيم عند الإخفاء
                document.querySelectorAll('input[name="otherDevicesType"]').forEach(cb => cb.checked = false);
                document.querySelector('input[name="otherDevicesDurationTotal"]').value = '';
                document.querySelector('input[name="otherDevicesDurationSingle"]').value = '';
                document.querySelector('input[name="otherDevicesDurationDaily"]').value = '';
            }
        });
    });
    
    if (form) {
        form.addEventListener("submit", handleSurveySubmit);
    }
});

async function handleSurveySubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = collectFormData();
    try {
        const response = await fetch("/survey", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            localStorage.setItem('surveySubmitted', 'true');
            document.getElementById('surveyForm').style.display = 'none';
            document.getElementById('thankYouSection').style.display = 'block';
        } else {
            alert("❌ حدث خطأ في السيرفر، يرجى المحاولة لاحقاً.");
        }
    } catch (err) {
        console.error(err);
        alert("❌ حدث خطأ أثناء الإرسال، يرجى التأكد من اتصال الإنترنت.");
    }
}

function validateForm() {
    const consent = document.querySelector('input[name="consent"]:checked');
    if (!consent || consent.value === 'لا') {
        alert('يجب الموافقة على المشاركة');
        return false;
    }
    return true;
}

function collectFormData() {
    const data = {
        id: 'survey_' + Date.now(),
        timestamp: new Date().toISOString()
    };
    const formElements = document.getElementById("surveyForm").elements;
    
    // تجميع القيم من كافة عناصر النموذج
    for (let element of formElements) {
        if (!element.name) continue;
        if (element.type === "radio") {
            if (element.checked) data[element.name] = element.value;
        } else if (element.type === "checkbox") {
            if (element.checked) {
                if (!data[element.name]) {
                    data[element.name] = element.value;
                } else {
                    data[element.name] += ", " + element.value;
                }
            }
        } else {
            data[element.name] = element.value;
        }
    }
    return data;
}
