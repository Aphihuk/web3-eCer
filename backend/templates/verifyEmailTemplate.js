const verifyEmailTemplate = (verificationUrl) => `
<div style="font-family: 'Noto Sans Lao', Arial, sans-serif; background-color: #f9fafb; padding: 50px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">

        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">Verliflie</h1>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">ກະລຸນາຢືນຢັນອີເມລຂອງທ່ານ</h2>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.8; margin-bottom: 0;">
                ຂອບໃຈທີ່ລົງທະບຽນນຳພວກເຮົາ! ເພື່ອເລີ່ມຕົ້ນການໃຊ້ງານຢ່າງເຕັມຮູບແບບ,
                ກະລຸນາຄລິກປຸ່ມລຸ່ມນີ້ເພື່ອຢືນຢັນວ່າທີ່ຢູື່ອີເມລນີ້ແມ່ນຂອງທ່ານແທ້.
            </p>
        </div>

        <div style="text-align: center; margin-bottom: 35px;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 35px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                ຢືນຢັນອີເມລດຽວນີ້
            </a>
        </div>

        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-bottom: 10px;">
            ຫາກປຸ່ມຂ້າງເທິງໃຊ້ງານບໍ່ໄດ້, ທ່ານສາມາດກັອບປີ້ລິ້ງລຸ່ມນີ້ໄປວາງທີ່ Browser ຂອງທ່ານ:
        </p>
        <p style="text-align: center; margin: 0;">
            <a href="${verificationUrl}" style="color: #2563eb; font-size: 12px; word-break: break-all; text-decoration: none;">
                ${verificationUrl}
            </a>
        </p>

    </div>

    <div style="text-align: center; margin-top: 25px;">
        <p style="color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} Verliflie Team. All rights reserved. <br>
            ນີ້ແມ່ນອີເມລອັດຕະໂນມັດ, ກະລຸນາຢ່າຕອບກັບ.
        </p>
    </div>
</div>
`;

module.exports = verifyEmailTemplate;
