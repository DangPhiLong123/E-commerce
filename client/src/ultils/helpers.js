import icons from './icons'

const {FaStar, FaRegStar} =icons

export const createSlug = string => string.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').split(' ').join('-')

export const formatPrice = number => {
    if (!number || isNaN(number)) return '0';
    return Number(number?.toFixed(1)).toLocaleString();
}

export const formatMoney = number => {
    return Number(number?.toFixed(1)).toLocaleString();
};

export const renderStarFromNumber = (number) => {
    if (!Number(number)) return
    const stars = []
    for(let i = 0; i<+number; i++) stars.push(<FaStar color='orange' />)
    for(let i = 5; i>+number; i--) stars.push(<FaRegStar color='orange'/>)

    return stars
}

export const validate = (payload, setInvalidFields) => {
    let invalids = 0 
    const formatPayload = Object.entries(payload)
    setInvalidFields([]) // Reset invalid fields before new validation

    for (let arr of formatPayload) {
        if (arr[1].trim() === '') {
            invalids++
            setInvalidFields(prev => [...prev, {name: arr[0], mes: 'Require this field.'}])
        }
    }
    
    for (let arr of formatPayload) {
        switch (arr[0]) {
            case 'email':
                const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                if (!arr[1].match(regex)) {
                    invalids++
                    setInvalidFields(prev => [...prev, {name: arr[0], mes: 'Email invalid.'}])
                }
                break;
            case 'password':
                if (arr[1].length < 6) {
                    invalids++
                    setInvalidFields(prev => [...prev, {name: arr[0], mes: 'Password minimum 6 characters.'}])
                }
                break;
            case 'mobile':
                const phoneRegex = /^[0-9]{10}$/
                if (!arr[1].match(phoneRegex)) {
                    invalids++
                    setInvalidFields(prev => [...prev, {name: arr[0], mes: 'Phone number must be 10 digits.'}])
                }
                break;
            case 'firstname':
            case 'lastname':
                const nameRegex = /^[a-zA-Z0-9\s]+$/
                if (!arr[1].match(nameRegex)) {
                    invalids++
                    setInvalidFields(prev => [...prev, {name: arr[0], mes: 'Name cannot contain special characters.'}])
                }
                break;
            default:
                break;
        }
    }

    return invalids
}