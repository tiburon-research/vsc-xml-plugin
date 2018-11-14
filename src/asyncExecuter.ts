import { OrderedCollection } from "./classes";

/** Клас для создания набора событий */
export class TaskList
{
    private queue = new OrderedCollection<Promise<any>>();
    private totalCounter: number = 0;
    
    private remove(ind: number)
    {
        this.queue.Remove(ind.toString());
        if (this.queue.Count == 0 && !!this.OnEnd) this.OnEnd();
    }

    constructor()
    {}
    
    /** Добавление элемента в список */
    public Add(prom: Promise<any>)
    {
        this.totalCounter++
        let newInd = this.totalCounter;
        prom.then(() => this.remove(newInd));
        this.queue.Add(newInd.toString(), prom);
    }

    /** Количество неоконченных */
    public get Count(): number
    {
        return this.queue.Count;
    }

    /** Функция вызываемая при освобождении всего списка */
    public OnEnd = function () { };

    /** Promise окончания текущих событий */
    public ResultPromise(): Promise<void>
    {
        // рекурсивный Promise
        return new Promise<void>((resolve, reject) =>
        {
            Promise.all(this.queue.ToArray(x => x.Value)).then(() =>
            {
                if (this.Count == 0) resolve();
                else this.ResultPromise().then(() => resolve());
            }); 
        });
    }

    
}