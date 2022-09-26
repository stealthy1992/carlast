import { createContext, useContext, useState } from "react";

export const CarContext = createContext()

export const CarContextProvider = ({children}) => {

    const [ value, setValue ] = useState([])
    const [ count, setCount ] = useState(0)
    const [ exists, setExists ] = useState(false)

    const emptyCart = () => {
        setValue([])
        setCount(0)
    }

    const buyOrder = ( val ) => {
        value?.map((item) => {
            if(val.name === item.name)
            {
                setExists(true)
            }
           
        })

        setValue( value => [...value, val])
        setCount((count) => count + 1)
        
        
    }
    const rentOrder = ( val ) => {
        console.log('entered')
        setValue(val)
        console.log(value)
    }

    return(
        <CarContext.Provider value={{exists, emptyCart, buyOrder, rentOrder, value, count}}>
            {children}
        </CarContext.Provider>
    )
}

export const useCarContextProvider = () => useContext(CarContext)
