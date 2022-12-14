import styled from 'styled-components';
import imageHeadset from "./assets/headphone.png"
import imageCart from "./assets/cart.png"
import imageWishlist from "./assets/wish.png"

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
    margin: 6vh 2vw;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px; 
    color: #000000
`;

export const Shipping = styled.p` 
    position: relative;
    flex-direction: row;
    align-items: flex-start;
    padding: 4px 8px;
    gap: 10px;
    width: 112px;
    height: 29px;
    left: 0px;
    top: 0px;
    background: #191847;
    border-radius: 20px;
    color: #FFFFFF;
    margin-block-end: 1vh;
`;

export const Title = styled.h2` 
    width: 419px;
    height: 72px;
    left: 0px;
    top: 39px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 36px;
    color: #191847;
`;

export const PriceOff = styled.p`
    width: 54px;
    height: 21px;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 21px;
    text-decoration-line: line-through;
    color: #191847;
    flex: none;
    order: 0;
    flex-grow: 0;
    margin-block-start: 3vh;
`;

export const PriceOn = styled.p` 
    width: 120px;
    height: 72px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 700;
    font-size: 48px;
    line-height: 72px;
    color: #191847;
    flex: none;
    order: 1;
    flex-grow: 0;
`;

export const Offer = styled.p` 
    width: 369px;
    height: 21px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: #191847;
    opacity: 0.6;
    flex: none;
    order: 2;
    flex-grow: 0;
    margin-block: 1vh;
`;

export const ButtonAdd = styled.button` 
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    padding: 16px;    
    width: 442px;
    height: 59px;
    background: #4788E9;
    box-shadow: 0px 7px 0px #1C57EE;
    border-radius: 8px;
    border: 1px solid #4788E9;
    flex: none;
    order: 2;
    flex-grow: 0;
    cursor: pointer;
    color: #FFFFFF;
    margin-block: 3vh;
`;

export const Stock = styled.p` 
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 21px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    flex: none;
    order: 1;
    flex-grow: 0;
    margin-block: 1vh;
    color: #000000;
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

export const IconWishlist = styled.div`
    width: 27px;
    height: 23px;
    background-image: url(${imageWishlist});
    flex: none;
    order: 0;
    flex-grow: 0;
    margin-inline-end: 15px;
`;

export const Buttons = styled.button`  
    display: flex;
    border: none;
    background: none;    
    button {
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
    }
`;
