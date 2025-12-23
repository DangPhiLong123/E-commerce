import path from "./path"
import icons from "./icons"

export const navigation = [
    {
        id: 1,
        value: 'HOME',
        textKey: 'nav.home',
        path: `/${path.HOME}`
    },
    {
        id: 2,
        value: 'PRODUCTS',
        textKey: 'nav.products',
        path: `/${path.PRODUCTS}`
    },
    {
        id: 3,
        value: 'BLOGS',
        textKey: 'nav.blogs',
        path: `/${path.BLOGS}`
    },
    {
        id: 4,
        value: 'OUR SERVICES',
        textKey: 'nav.our_services',
        path: `/${path.OUR_SERVICES}`
    },
    {
        id: 5,
        value: 'FAQs',
        textKey: 'nav.faqs',
        path: `/${path.FAQ}`
    },
]

export const colors = [
    'black',
    'brown',
    'gray',
    'white',
    'pink',
    'yellow',
    'orange',
    'purple',
    'green',
    'blue',
    
]

export const sorts = [
    {
        id:1,
        value: '-sold',
        text: 'Best Selling'
    },
    {
        id:2,
        value: 'title',
        text: 'Alphabetically, A-Z'
    },
    {
        id:3,
        value: '-title',
        text: 'Alphabetically, Z-A'
    },
    {
        id:4,
        value: '-price',
        text: 'Price: High to Low'
    },
    {
        id:5,
        value: 'price',
        text: 'Price: Low to High'
    },
    {
        id:6,
        value: '-createdAt',
        text: 'Date: New to Old'
    },
    {
        id:7,
        value: 'createdAt',
        text: 'Date: Old to New'
    }
]

const {MdSpaceDashboard, GrUserManager, FaProductHunt, RiBillLine, MdBroadcastOnPersonal, FaShoppingCart, FaHeart, MdWorkHistory  } = icons
export const adminSidebar = [
    {
        id: 1,
        type: 'SINGLE',
        text: 'Dashboard',
        path: `/${path.ADMIN}/${path.DASHBOARD}`,
        icon: <MdSpaceDashboard size={20}/>
    },
    {
        id: 2,
        type: 'SINGLE',
        text: 'Manage users',
        path: `/${path.ADMIN}/${path.MANAGE_USER}`,
        icon: <GrUserManager size={20}/>
    },
    {
        id: 3,
        type: 'PARENT',
        text: 'Manage Products',
        icon: <FaProductHunt size={20}/> ,
        submenu: [
            {
                text: 'Create product',
                path: `/${path.ADMIN}/${path.CREATE_PRODUCTS}`
            },
            {
                text: 'Manage product',
                path: `/${path.ADMIN}/${path.MANAGE_PRODUCTS}`

            }
        ],
    },
    {
        id: 4,
        type: 'SINGLE',
        text: 'Manage order',
        path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
        icon: <RiBillLine size={20} />
    },
    {
        id: 5,
        type: 'SINGLE',
        text: 'Analytics',
        path: `/${path.ADMIN}/${path.ANALYTICS}`,
        icon: <MdSpaceDashboard size={20}/>
    },
]

export const memberSidebar = [
    {
        id: 1,
        type: 'SINGLE',
        text: 'Personal',
        path: `/${path.MEMBER}/${path.PERSONAL}`,
        icon: <MdBroadcastOnPersonal size={20}/>
    },
    {
        id: 2,
        type: 'SINGLE',
        text: 'My Cart',
        path: `/${path.MEMBER}/${path.MY_CART}`,
        icon: <FaShoppingCart size={20}/>
    },
    {
        id: 3,
        type: 'SINGLE',
        text: 'Wishlist',
        path: `/${path.MEMBER}/${path.WISHLIST}`,
        icon: <FaHeart size={20}/>
    },
    {
        id: 4,
        type: 'SINGLE',
        text: 'History',
        path: `/${path.MEMBER}/${path.HISTORY}`,
        icon: <MdWorkHistory size={20} />
    },
    
]

export const roles = [
    {
        code: 1223,
        value: 'Admin',
    },
    {
        code: 2003,
        value: 'User'
    }
]