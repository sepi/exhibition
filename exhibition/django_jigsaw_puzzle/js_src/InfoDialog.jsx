import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export function InfoDialog({showInfo, setShowInfo, dialogTitle}) {
    return (
	<Dialog
	    open={showInfo}
	    onClose={() => setShowInfo(false)}
	    aria-labelledby="alert-dialog-title"
	    aria-describedby="alert-dialog-description" >
	    <DialogTitle id="alert-dialog-title">
		{dialogTitle}
	    </DialogTitle>
	    <DialogContent>
		<p>
		    This application was written by Raffael Mancini (raffael@mancini.lu). It is licensed
		    under the GNU Affero General Public License version 3.0 (AGPLv3). Terms can
		    be found <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">here</a>
		</p>
		<hr/>
		<p>
		    It builds on the <a href="https://github.com/erikthalen/jigsaw-puzzle/">jigsaw-puzzle</a>
		    library written by Eric Thalen which is released under the MIT License.
		    Many thanks for this amazing work!
		</p>

		<b>MIT License</b>
		<p>Copyright (c) 2022 Erik Thalén</p>
		<p>
		    Permission is hereby granted, free of charge, to any person obtaining a copy
		    of this software and associated documentation files (the "Software"), to deal
		    in the Software without restriction, including without limitation the rights
		    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		    copies of the Software, and to permit persons to whom the Software is
		    furnished to do so, subject to the following conditions:
		</p>
		<p>
		    The above copyright notice and this permission notice shall be included in all
		    copies or substantial portions of the Software.
		</p>
		<p>
		    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		    SOFTWARE.
		</p>
	    </DialogContent>
	    <DialogActions> 
		<Button onClick={() => setShowInfo(false)}>Ok</Button>
	    </DialogActions>
	</Dialog>
    );
}
