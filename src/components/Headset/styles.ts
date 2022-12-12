import styled from 'styled-components';

export const Main = styled.div`
    position: absolute;
    width: 887px;
    height: 661px;
    left: 356px;
    top: 10vh;
    background: #FFFFFF;
    box-shadow: 0px 24px 28px 9px rgba(179, 193, 217, 0.33);
    border-radius: 15px;
`;

export const Container = styled.div`
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px;
    gap: 32px;
    width: 723px;
    height: 497px;
    color: #000000
`;

export const Image = styled.div` 
    width: 249px;
    height: 223px;
    background: url(./assets/headphone.png);
    flex: none;
    order: 0;
    flex-grow: 0;
`;

export const Details = styled.div` 
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 0px; 
    color: #000000
`;

export const Shipping = styled.p` 
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 4px 8px;
    gap: 10px;
    position: absolute;
    width: 112px;
    height: 29px;
    left: 0px;
    top: 0px;
    background: #191847;
    border-radius: 20px;
    color: #FFFFFF;
`;

export const Title = styled.h2` 
    position: absolute;
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
`;

export const ButtonAdd = styled.button` 
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 10px;
    width: 442px;
    height: 59px;
    background: #4788E9;
    box-shadow: 0px 7px 0px #1C57EE;
    border-radius: 8px;
    flex: none;
    order: 2;
    align-self: stretch;
    flex-grow: 0;
`;

export const Ball = styled.div` 
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #00D98B;
    flex: none;
    order: 0;
    flex-grow: 0;
`;

export const Stock = styled.p` 
    width: 117px;
    height: 21px;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    color: #000000;
    flex: none;
    order: 1;
    flex-grow: 0;
`;

export const ButtonCart = styled.button` 
    box-sizing: border-box; 
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 10px;
    width: 213px;
    height: 64px;
    border: 2px solid #C9C9DA;
    border-radius: 8px; 
    flex: none;
    order: 0;
    flex-grow: 1;
`;

export const ButtonWishlist = styled.button` 
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 10px;
    width: 213px;
    height: 64px;
    border: 2px solid #C9C9DA;
    border-radius: 8px;
    flex: none;
    order: 1;
    flex-grow: 1;
`;

