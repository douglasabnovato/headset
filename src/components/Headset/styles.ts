import styled from 'styled-components';

import imageHeadset from "./assets/imageHeadphone.png"
import imageCart from "./assets/imageCart.png"
import imageWish from "./assets/imageWish.png"

export const Main = styled.div`
    position: relative;
    display: flex;
`;

export const Container = styled.div`
    position: relative;
    display: flex;
    margin: 3vh auto;
    width: 887px;
    height: 661px;
    background: #FFFFFF;
    box-shadow: 0px 24px 28px 9px rgba(179, 193, 217, 0.33);
    border-radius: 15px;
`;

export const Image = styled.div`
    position: relative;
    width: 249px;
    height: 223px;
    margin: 6vh 2vw;
    background-image: url(${imageHeadset});
    flex: none;
    order: 0;
    flex-grow: 0;
`;

export const Details = styled.div`  
    position: relative;
    display: block;
    margin: 6vh 0vw;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px; 
    color: #000000
`;

export const Shipping = styled.p` 
    position: relative;
    flex-direction: row;
    align-items: flex-start;
    padding: 4px 10px;
    gap: 10px;
    width: 119px;
    height: 29px;
    left: 0px;
    top: 0px;
    background: #191847;
    border-radius: 20px;
    margin-block-end: 1vh;

    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
`;

export const Title = styled.h2` 
    width: 419px;
    height: 72px;
    left: 0px;
    top: 39px;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 36px;
    color: #191847;
`;

export const PriceOff = styled.p`
    width: 54px;
    height: 21px;
    text-decoration-line: line-through;
    color: #191847;
    flex: none;
    order: 0;
    flex-grow: 0;
    
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 21px;

    margin-block-start: 3vh;
`;

export const PriceOn = styled.p` 
    width: 120px;
    height: 72px;

    color: #191847;
    flex: none;
    order: 1;
    flex-grow: 0;
    
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 700;
    font-size: 48px;
    line-height: 72px;
`;

export const Offer = styled.p` 
    width: 369px;
    height: 21px;
    
    color: #191847;
    opacity: 0.6;
    flex: none;
    order: 2;
    flex-grow: 0;

    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
`;

export const ButtonPrimary = styled.button` 

    margin-block-start: 20px;
    margin-block-end: 25px;

    background-color:#4788e9;
    position:relative;

    border: none;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 10px;

    width: 442px;
    height: 59px;

    text-shadow: 0px 1px 0px #000;
    filter: dropshadow(color=#000, offx=0px, offy=1px);
    box-shadow:inset 0 1px 0 #c5dbfc, 0 10px 0 #1C57EE ; 
    border-radius: 8px;
    
    flex: none;
    order: 2;
    align-self: stretch;
    flex-grow: 0;

    color:white;
    font-family:'Poppins', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 27px;
    text-align: center;

    color: #FFFFFF;

    &:active{
        top:10px;
        background-color:#0962e6; 
        box-shadow:inset 0 1px 0 #c5dbfc, inset 0 -3px 0 #00378a; 
    }

    &:after{
        content:"";
        height:100%;
        width:100%;
        padding:4px;
        position: absolute;
        bottom:-15px;
        left:-4px;
        z-index:-1;
        background-color:#000c1f;
        border-radius: 5px;
    }

    &:hover {
        background: rgb(71, 136, 233);
        background: linear-gradient(0deg, rgba(71, 136, 233) 0%, rgba(2,126,251,1) 100%);
        cursor: pointer;
    }
`;

export const Stock = styled.p` 
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 21px;
    flex: none;
    order: 1;
    flex-grow: 0;
    margin-block-end: 3vh;
    color: #000000;
    
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
`;

export const Ball = styled.div` 
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #00D98B;
    flex: none;
    order: 0;
    flex-grow: 0;
    margin-inline-end: .3vw;
`;

export const IconCart = styled.div`
    width: 29px;
    height: 30px;
    background-image: url(${imageCart});
    flex: none;
    order: 0;
    flex-grow: 0;
    margin-inline-end: 15px;
`;

export const IconWish = styled.div`
    width: 27px;
    height: 23px;
    background-image: url(${imageWish});
    flex: none;
    order: 0;
    flex-grow: 0;
    margin-inline-end: 15px;
`;

export const ButtonGroup = styled.div`  
    display: flex;
    border: none;
    background: none; 
`;

export const ButtonStyled = styled.button`
    display: flex;
    box-sizing: border-box;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    width: 213px;
    height: 64px;
    border: 2px solid #C9C9DA;
    border-radius: 8px; 
    flex-grow: 1;
    cursor: pointer;
    margin: 6px;

    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 27px;
    color: #191847;
    flex: none;
    order: 1;
    flex-grow: 0;
`
