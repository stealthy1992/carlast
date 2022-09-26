import React from 'react'
import { urlFor } from '../lib/client'

const FooterBanner = ({footer}) => {
  return (
    <div className='footer-banner-container'>
        { footer && console.log(footer[0])}
      <div className='banner-desc'>
        <div className='left'>
          <p>{footer[0].topLeftSmallText}</p>
          <h3>{footer[0].topLeftBigText}</h3>
          <h3>{footer[0].bottomLeftBigText}</h3>
          <p>{footer[0].bottomLeftSmallText}</p>
        </div>
        <div className='right'>
          <p>{footer[0].topRightSmallText}</p>
          <h3>{footer[0].topLeftBigText}</h3>
          <p>{footer[0].bottomRightSmallText}</p>
          {/* <Link href={`/product/${product}`}> */}
            <button type="button">
            {footer[0].buttonText}
            </button>
          {/* </Link> */}

        </div>
        <img src={urlFor(footer[0].image)} className="footer-banner-image"/>

      </div>
      
    </div>
  )
}

export default FooterBanner
