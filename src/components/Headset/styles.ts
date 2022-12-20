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
    background: ${props => props.theme.colors.text};
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
    color: ${props => props.theme.colors.text};
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
    background: ${props => props.theme.colors.secundary[900]};
    border-radius: 20px;
    margin-block-end: 1vh;
    color: ${props => props.theme.colors.text};
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
    background-color: ${props => props.theme.colors.secundary[600]}; 
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
    text-shadow: 0px 1px 0px #000000;
    filter: dropshadow(color=#000000, offx=0px, offy=1px);
    box-shadow:inset 0 1px 0 ${props => props.theme.colors.secundary[300]}, 0 10px 0 ${props => props.theme.colors.secundary[700]};
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
    color: ${props => props.theme.colors.text};
    &:active{
        top:10px;
        background-color: ${props => props.theme.colors.secundary[1000]}; 
        box-shadow:inset 0 1px 0 ${props => props.theme.colors.secundary[300]}, inset 0 -3px 0 ${props => props.theme.colors.secundary[800]};
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
        background-color: ${props => props.theme.colors.secundary[900]};
        border-radius: 5px;
    }
    &:hover {
        background: ${props => props.theme.colors.secundary[600]};
        background: linear-gradient(0deg, ${props => props.theme.colors.secundary[400]} 0%, ${props => props.theme.colors.secundary[500]} 100%); 
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
    border: 2px solid ${props => props.theme.colors.secundary[600]};
    border-radius: 8px; 
    flex-grow: 1;
    cursor: pointer;
    margin: 6px;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 27px;
    color: ${props => props.theme.colors.secundary[900]};
    flex: none;
    order: 1;
    flex-grow: 0;
`
