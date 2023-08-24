import { Alert, AlertColor, Dialog, DialogContent } from '@mui/material';

interface ConfirmedDialogProps {
  open: boolean;
  alert?: AlertColor;
  text: string;
  setOpen: (value: boolean) => void;
}

export const ConfirmedDialog = (props: ConfirmedDialogProps) => {
  return (
    <Dialog open={props.open} onClose={() => props.setOpen(false)}>
      <DialogContent>
        <Alert severity={props.alert || 'success'}>{props.text}</Alert>
      </DialogContent>
    </Dialog>
  );
};
