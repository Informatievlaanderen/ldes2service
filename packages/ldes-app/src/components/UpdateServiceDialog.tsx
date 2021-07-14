import { IConfigTemplate, IConfigTemplates, IConnectorService } from '@ldes/types';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import { H2 } from './Headings';
import { Label, InputGroup, Textarea, Select, Submit } from './Input';
import { servicesVersion } from 'typescript';

type TemplateValue = {
  [k in string]: string;
};

interface Props {
  service: IConnectorService;
}

export function UpdateServiceDialog(props: Props) {
  const [showDialog, setShowDialog] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <div>
      <button onClick={open}>Update Service</button>

      <Dialog isOpen={showDialog} onDismiss={close}>
        <button className="close-button" onClick={close}>
          <span aria-hidden>×</span>
        </button>

        <H2>Update {props.service.name}</H2>
        <form>
          <div>
            <InputGroup>
              <Label htmlFor={'ldes'}>Add LDES</Label>

              <Textarea id={'ldes'} />
              <p>Every LDES should be on a different line.</p>
            </InputGroup>

            {/* <TemplateConfigInput template={} value={} onChange={}/> */}
          </div>

          <button onClick={close} >Cancel</button>
          <Submit value="Save" />
        </form>
      </Dialog>
    </div>
  );
}
