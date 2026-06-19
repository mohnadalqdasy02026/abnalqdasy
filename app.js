// ============================================
// نظام استبيان جامعة صنعاء - app.js
// ============================================

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById("surveyForm");

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {

            // إخفاء الاستبيان
            document.getElementById('surveyForm').style.display = 'none';

            // عرض رسالة الشكر وزر استبيان جديد
            const thankYouSection = document.getElementById('thankYouSection');

            thankYouSection.innerHTML = `
                <div class="thank-you-box" style="
                    text-align:center;
                    padding:40px;
                    background:white;
                    border-radius:15px;
                    box-shadow:0 4px 15px rgba(0,0,0,0.1);
                ">
                    <h2 style="color:#2c3e50;">شكراً لك 🎉</h2>

                    <p style="margin:15px 0;">
                        تم إرسال الاستبيان بنجاح.
                    </p>

                    <button
                        id="newSurveyBtn"
                        class="btn-primary"
                        style="
                            margin-top:20px;
                            padding:12px 25px;
                            cursor:pointer;
                        "
                    >
                        تعبئة استبيان آخر
                    </button>
                </div>
            `;

            thankYouSection.style.display = 'block';

            // زر تعبئة استبيان جديد
            document
                .getElementById('newSurveyBtn')
                .addEventListener('click', function () {

                    const form = document.getElementById('surveyForm');

                    // إعادة تعيين جميع الحقول
                    form.reset();

                    // إخفاء رسالة الشكر
                    thankYouSection.style.display = 'none';

                    // إظهار الاستبيان
                    form.style.display = 'block';

                    // العودة لأعلى الصفحة
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });

                });

        } else {

            alert("❌ حدث خطأ في السيرفر، يرجى المحاولة لاحقاً.");

        }

    } catch (err) {

        console.error(err);

        alert("❌ حدث خطأ أثناء الإرسال، يرجى التأكد من اتصال الإنترنت.");

    }

}

function validateForm() {

    const consent = document.querySelector(
        'input[name="consent"]:checked'
    );

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

    const formElements =
        document.getElementById("surveyForm").elements;

    // تجميع بيانات النموذج
    for (let element of formElements) {

        if (!element.name) continue;

        if (element.type === "radio") {

            if (element.checked) {
                data[element.name] = element.value;
            }

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
