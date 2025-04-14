'use client';

import Link from 'next/link';
import styled from 'styled-components';

const UiverseButton = () => {
  return (
    <StyledWrapper>
      <Link href="/login" passHref legacyBehavior>
        <a className="button" data-text="Awesome">
          <span className="actual-text">&nbsp;Login&nbsp;</span>
          <span aria-hidden="true" className="hover-text">&nbsp;Login&nbsp;</span>
        </a>
      </Link>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    margin: 0;
    height: auto;
    background: transparent;
    padding: 0;
    border: none;
    cursor: pointer;
    
    --border-right: 6px;  
    --border-left: 6px;
    --text-stroke-color: rgba(105, 102, 102, 0.6);
    --animation-color: hsl(221, 83%, 53%);
    --hover-color: blue;
    --fs-size: 1rem;

    letter-spacing: 3px;
    text-decoration: none;
    font-size: var(--fs-size);
    font-family: "Arial";
    position: relative;
    text-transform: uppercase;
    color: transparent;
    -webkit-text-stroke: 0.5px var(--text-stroke-color);
    display: inline-block;
  }

  .hover-text {
    position: absolute;
    box-sizing: border-box;
    content: attr(data-text);
    color: var(--animation-color);
    width: 0;
    inset: 0;
    border-right: var(--border-right) solid var(--animation-color);
    overflow: hidden;
    transition: width 0.8s ease; /* Smooth transition for width */
    -webkit-text-stroke: 1px var(--animation-color);
  }

  .button:hover .hover-text {
    width: 100%; /* Expand width from left to right */
    color: var(--hover-color); /* Change text color to blue on hover */
    filter: drop-shadow(0 0 23px var(--hover-color));
  }
`;

export default UiverseButton;