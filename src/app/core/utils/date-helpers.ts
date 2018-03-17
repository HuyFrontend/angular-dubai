import * as moment from 'moment';

export const CAMPAIGN_DATE_FORMAT = 'YYYY-MM-DD HH:mm';

const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const HOROSCROPE_BY_MONTHS = {
    jan: {
        first: { val: 19, name: 'Capricorn' },
        after: { val: 20, name: 'Aquarius' }
    },
    feb: {
        first: { val: 18, name: 'Aquarius' },
        after: { val: 19, name: 'Pisces' },
    },
    mar: {
        first: { val: 20, name: 'Pisces' },
        after: { val: 21, name: 'Aries' }
    },
    apr: {
        first: { val: 19, name: 'Aries' },
        after: { val: 20, name: 'Taurus' }
    },
    may: {
        first: { val: 20, name: 'Taurus' },
        after: { val: 21, name: 'Gemini' }
    },
    jun: {
        first: { val: 20, name: 'Gemini' },
        after: { val: 21, name: 'Cancer' }
    },
    jul: {
        first: { val: 22, name: 'Cancer' },
        after: { val: 23, name: 'Leo' }
    },
    aug: {
        first: { val: 22, name: 'Leo' },
        after: { val: 23, name: 'Virgo' }
    },
    sep: {
        first: { val: 22, name: 'Virgo' },
        after: { val: 23, name: 'Libra' }
    },
    oct: {
        first: { val: 22, name: 'Libra' },
        after: { val: 23, name: 'Scorpio' }
    },
    nov: {
        first: { val: 21, name: 'Scorpio' },
        after: { val: 22, name: 'Sagittarius' }
    },
    dec: {
        first: { val: 21, name: 'Sagittarius' },
        after: { val: 22, name: 'Capricorn' }
    }
};      

const getMonthWithHoroscope = (month: number): any => {
    const monthKey = monthKeys[month];
    return HOROSCROPE_BY_MONTHS[monthKey];
};

const getHoroscope = (dateOfMonth: number, horoscrope: any): any => {
    let result = ''; 

    Object.keys(horoscrope).reduce((preVal, curVal, idx, arr) => {
        const { val, name } = horoscrope[curVal];
        if(curVal === 'first' && dateOfMonth <= val) result = name;
        if(curVal === 'after' && dateOfMonth >= val) result = name;
        return result;
    }, '');

    return result;
}

export const getHoroscopeName = (date: Date) =>  {
    return getHoroscope(date.getDate(), getMonthWithHoroscope(date.getMonth()));
};

export const getDateFormat = (date: Date, format?: string) => {
    
    if(!date){
        return '';
    }
    return moment(date).format(!format ? 'DD/MM/YYYY hh:mm A' : format);

};

export const getDate = (date: string, format?: string) : Date => {
    return format ? moment(date, format).toDate() : moment(date).toDate();
}
