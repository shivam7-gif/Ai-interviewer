import axios from "axios";

export const leetCodeQuestionService =async (companyName: string[])=>{
    const companyNameMap ={
        "google": "google",
        "amazon": "amazon",
        "microsoft": "microsoft",
        "facebook": "facebook",
        "apple": "apple",
        "tesla": "tesla",
    }
    let url=``
    companyName.forEach(company => {
        const mappedCompanyName = companyNameMap[company];
        if (mappedCompanyName) {
            url += `https://alfa-leetcode-api.onrender.com/company/${mappedCompanyName}`;
        }
    });
    return (
        
    )
}