import { RefObject } from "react";
import InputForEditProfile from "./InputForEditProfile";

const InputPhoneNumberEP = ({label, countryCodeRef, phoneNumberRef}) => {
    return (
        <div className="flex gap-[12px] w-full">
            <div className="flex rounded-md border border-[#3A35411F]">
                <select name="country-code" id="country-code" ref={countryCodeRef} className="rounded-r-md px-[10px] py-[4px] min-w-[70px] h-[48px] text-[#222325]">
                    <option value="62">+62</option>
                </select>
            </div>
            <InputForEditProfile label={label} ref={phoneNumberRef} />
        </div>
    )
}

export default InputPhoneNumberEP;