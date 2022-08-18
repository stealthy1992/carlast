import { createContext, useContext, useState } from "react";

export const CarContext = createContext()

export const CarContextProvider = ({children}) => {

    const [ value, setValue ] = useState([])
    const [ count, setCount ] = useState(0)

    const emptyCart = () => {
        setValue([])
        setCount(0)
    }

    const buyOrder = ( val ) => {
        setValue( value => [...value, val])
        setCount((count) => count + 1)
    }
    const rentOrder = ( val ) => {
        setValue(val)
    }

    return(
        <CarContext.Provider value={{emptyCart, buyOrder, rentOrder, value, count}}>
            {children}
        </CarContext.Provider>
    )
}

export const useCarContextProvider = () => useContext(CarContext)
