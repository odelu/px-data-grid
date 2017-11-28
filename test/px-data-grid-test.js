const data = [{
  'first': 'Elizabeth',
  'last': 'Wong',
  'email': 'sika@iknulber.cl'
}, {
  'first': 'Jeffrey',
  'last': 'Hamilton',
  'email': 'cofok@rac.be'
}, {
  'first': 'Alma',
  'last': 'Martin',
  'email': 'dotta@behtam.la'
}, {
  'first': 'Carl',
  'last': 'Saunders',
  'email': 'seh@bibapu.gy'
}, {
  'first': 'Willie',
  'last': 'Dennis',
  'email': 'izko@dahokwej.ci'
}];


document.addEventListener('WebComponentsReady', function() {
  runTests();
});


function runTests() {

  describe('Unit Tests for px-data-grid', () => {
    let grid;
    let timeoutSpy;

    function getRows() {
      return grid._vaadinGrid.$.items.querySelectorAll('tr');
    }

    function getRowCells(row) {
      return Array.prototype.slice.call(Polymer.dom(row).querySelectorAll('[part~="cell"]'));
    }

    beforeEach((done) => {
      grid = fixture('simple-grid');
      grid.tableData = data;

      Polymer.RenderStatus.afterNextRender(grid, () => {
        setTimeout(() => { // IE11
          done();
        });
      });
    });

    describe('simple-grid tests', () => {
      it('should properly populate _generatedColumns', () => {
        expect(grid._generatedColumns.length).to.be.eql(3);
        expect(grid._generatedColumns[0].name).to.be.eql('first');
        expect(grid._generatedColumns[1].name).to.be.eql('last');
        expect(grid._generatedColumns[2].name).to.be.eql('email');
      });
    });

    describe('spinner', () => {
      function createTimeoutSpy() {
        timeoutSpy = sinon.spy(window, 'setTimeout');

        grid.remoteDataProvider = () => {};

        const call = timeoutSpy.getCalls().filter(call => call.returnValue === grid._spinnerHiddenTimeout)[0];
        return call.args;
      }

      it('should set _spinnerHiddenTimeout when assigning remoteDataProvider', () => {
        grid.remoteDataProvider = (params, callback) => {};
        expect(grid._spinnerHiddenTimeout).to.be.ok;
      });

      it('should hide spinner unless 500ms have passed', () => {
        grid.remoteDataProvider = (params, callback) => {};
        expect(grid.shadowRoot.querySelector('px-spinner').hasAttribute('hidden')).to.be.true;
      });

      it('should have proper timeout', () => {
        grid.loadingSpinnerDebounce = 1000;
        const timeout = createTimeoutSpy()[1];

        expect(timeout).to.equal(1000);
        timeoutSpy.restore();
      });

      it('should show spinner after 500ms when data is loading', () => {
        const timeoutCallback = createTimeoutSpy()[0];

        timeoutCallback();
        expect(grid.shadowRoot.querySelector('px-spinner').hasAttribute('hidden')).to.be.false;
        timeoutSpy.restore();
      });
    });

    describe('selection', () => {
      it('should add the item to selectedItems when row is clicked', (done) => {
        grid.selectable = true;
        Polymer.RenderStatus.afterNextRender(grid, () => {
          const rows = getRows();
          const cell = getRowCells(rows[1])[0];
          cell.click();
          expect(grid.selectedItems).to.eql([data[1]]);
          done();
        });
      });
    });

    describe('highlighting', () => {
      function flushVaadinGrid() {
        const vaadinGrid = grid.shadowRoot.querySelector('vaadin-grid');
        vaadinGrid._observer.flush();
        grid._observer.flush();
        if (vaadinGrid._debounceScrolling) {
          vaadinGrid._debounceScrolling.flush();
        }
        if (vaadinGrid._debounceScrollPeriod) {
          vaadinGrid._debounceScrollPeriod.flush();
        }
        Polymer.flush();
        if (vaadinGrid._debouncerLoad) {
          vaadinGrid._debouncerLoad.flush();
        }
      }

      beforeEach((done) => {
        flushVaadinGrid();
        window.flush(done);
      });

      it('should highlight cell', () => {
        grid.highlight = [{
          type: 'cell',
          color: 'red',
          condition: (cellData, column, item) => {
            return cellData === 'Alma';
          }
        }];

        expect(grid._getCellStyle(data[2], grid._generatedColumns[0])).to.eql('background: red');
      });

      it('should highlight row', () => {
        grid.highlight = [{
          type: 'row',
          color: 'yellow',
          condition: (cellData, item) => {
            return cellData === 'Saunders';
          }
        }];

        expect(grid._getCellStyle(data[3], grid._generatedColumns[0])).to.eq('background: yellow');
        expect(grid._getCellStyle(data[3], grid._generatedColumns[1])).to.eq('background: yellow');
        expect(grid._getCellStyle(data[3], grid._generatedColumns[2])).to.eq('background: yellow');
      });

      it('should highlight column', () => {
        grid.highlight = [{
          type: 'column',
          color: 'blue',
          condition: (column, item) => {
            return column.name === 'first';
          }
        }];

        data.forEach((d) => {
          expect(grid._getCellStyle(d, grid._generatedColumns[0])).to.eq('background: blue');
        });
      });
    });


    describe('grid-with-columns tests', () => {
      beforeEach((done) => {
        grid = fixture('grid-with-columns');
        grid.tableData = data;
        Polymer.RenderStatus.afterNextRender(grid, () => {
          setTimeout(() => { // IE11
            done();
          });
        });
      });

      it('should set _generatedColumns to empty array', () => {
        expect(grid._generatedColumns.length).to.be.eql(0);
      });
    });
  });
}