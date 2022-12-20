import styled from 'styled-components';

export const Container = styled.div`
  height: 60px;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
`;

export const TitlePage = styled.p` 
    position: relative;
    flex-direction: row;
    align-items: flex-start;
    padding: 4px 10px;
    gap: 10px;
    width: 119px;
    height: 29px;
    left: 0px;
    top: 0px;
    border-radius: 20px;
    margin-block-end: 1vh;
    color: ${props => props.theme.colors.text};
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    line-height: 21px;
`;
